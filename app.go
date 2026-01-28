package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/disintegration/imaging"
)

type App struct {
	ctx context.Context

	llmCmd *exec.Cmd
	llmPort int
}


type LlamaError struct {
	Error struct {
		Message string `json:"message"`
	} `json:"error"`
}

type LlamaResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}



func NewApp() *App {
	return &App{
		llmPort: 8080,
	}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.startLocalLLM()
}




func (a *App) startLocalLLM() {

    exePath := ` "Paste the route here" llm\llm\bin\llama-server.exe`
    modelPath := `Paste the route here\llm\llm\models\qwen2.5-1.5b-instruct-q4_0.gguf`

    cmd := exec.Command(
        exePath,
        "--model", modelPath,
        "--port", fmt.Sprintf("%d", a.llmPort),
        "--gpu-layers", "8",
    )

    
    cmd.Stdout = os.Stdout
    cmd.Stderr = os.Stderr

    fmt.Println("➡ Iniciando LLM...")

    if err := cmd.Start(); err != nil {
        fmt.Println("ERROR iniciando LLM:", err)
        return
    }

    a.llmCmd = cmd

    go a.waitLLMReady()
}



func (a *App) waitLLMReady() {

	for {
		respBytes, err := a.askLLM("ping")
		if err != nil {
			time.Sleep(1 * time.Second)
			continue
		}

		var llErr LlamaError
		if json.Unmarshal(respBytes, &llErr) == nil {
			if llErr.Error.Message == "Loading model" {
				time.Sleep(1 * time.Second)
				continue
			}
		}

		fmt.Println("✔ Modelo listo")
		return
	}
}




func (a *App) askLLM(prompt string) ([]byte, error) {

    url := fmt.Sprintf("http://127.0.0.1:%d/v1/chat/completions", a.llmPort)

    body := []byte(fmt.Sprintf(`{
        "model": "local",
        "messages": [{"role":"user","content":"%s"}]
    }`, prompt))

    resp, err := http.Post(url, "application/json", bytes.NewBuffer(body))
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    return io.ReadAll(resp.Body)
}



func (a *App) ProcessQuestion(q string) (string, error) {

    respBytes, err := a.askLLM(q)
    if err != nil {
        return "", err
    }

    var parsed LlamaResponse
    if err := json.Unmarshal(respBytes, &parsed); err != nil {
        return "", fmt.Errorf("Error interpretando respuesta: %v", err)
    }

    if len(parsed.Choices) == 0 {
        return "Sin respuesta", nil
    }

    return parsed.Choices[0].Message.Content, nil
}

// ProcessPDF procesa un PDF, lo convierte en imágenes, aplica OCR en español y limpia resultados
func (a *App) ProcessPDF(base64pdf string) map[string]interface{} {
	fmt.Println("➡ Iniciando ProcessPDF...")

	response := map[string]interface{}{
		"ok":    false,
		"error": "",
		"text":  "",
	}

	// Guardar PDF temporal 
	tmpDir := os.TempDir()
	timestamp := time.Now().UnixNano()
	tmpPDF := filepath.Join(tmpDir, fmt.Sprintf("temp_input-%d.pdf", timestamp))

	pdfBytes, err := base64.StdEncoding.DecodeString(base64pdf)
	if err != nil {
		response["error"] = fmt.Sprintf("Error al decodificar PDF: %v", err)
		return response
	}

	if err := os.WriteFile(tmpPDF, pdfBytes, 0644); err != nil {
		response["error"] = fmt.Sprintf("Error al guardar PDF: %v", err)
		return response
	}
	fmt.Println("✔ PDF guardado en:", tmpPDF)

	// Carpeta de salida de imágenes 
	outputDir := `C:\Users\LENOVO\Desktop\PDFImages`
	if err := os.MkdirAll(outputDir, os.ModePerm); err != nil {
		response["error"] = fmt.Sprintf("No se pudo crear carpeta de salida: %v", err)
		return response
	}

	// Convertir PDF a PNG 
	outputPrefix := filepath.Join(outputDir, fmt.Sprintf("temp_page-%d", timestamp))
	popplerPath := `C:\Users\LENOVO\AppData\Local\Programs\Release-25.11.0-0\poppler-25.11.0\Library\bin\pdftoppm.exe`

	cmd := exec.Command(popplerPath, "-png", "-r", "400", tmpPDF, outputPrefix)
	out, err := cmd.CombinedOutput()
	if err != nil {
		response["error"] = fmt.Sprintf("Error al convertir PDF a imagen: %v\nSalida: %s", err, string(out))
		return response
	}
	files, err := filepath.Glob(outputPrefix + "-*.png")
	if err != nil || len(files) == 0 {
		response["error"] = "No se generaron imágenes del PDF"
		return response
	}
	fmt.Println("✔ Archivos generados:", files)

	// Tesseract OCR 
	finalText := ""
	tesseractPath := `tesseract` 

	for _, file := range files {
		fmt.Println("➡ Procesando imagen:", file)

		
		imgFile, err := os.Open(file)
		if err != nil {
			finalText += fmt.Sprintf("[Error abrir imagen %s]\n", file)
			continue
		}
		img, _, err := image.Decode(imgFile)
		imgFile.Close()
		if err != nil {
			finalText += fmt.Sprintf("[Error decodificar imagen %s]\n", file)
			continue
		}

	
		gray := imaging.Grayscale(img)
		contrast := imaging.AdjustContrast(gray, 30)
		resized := imaging.Resize(contrast, contrast.Bounds().Dx()*2, 0, imaging.Lanczos)
		binarized := imaging.AdjustFunc(resized, func(c color.NRGBA) color.NRGBA {
			if c.R > 128 {
				return color.NRGBA{255, 255, 255, 255}
			}
			return color.NRGBA{0, 0, 0, 255}
		})

		tmpImg := file + "_processed.png"
		outFile, _ := os.Create(tmpImg)
		png.Encode(outFile, binarized)
		outFile.Close()


		cmd := exec.Command(tesseractPath, file, "stdout", "-l", "spa", "--psm", "12")

		output, err := cmd.CombinedOutput()
		if err != nil {
			fmt.Println("❌ Error OCR en", file)
			fmt.Println("Detalle:", string(output))
			finalText += fmt.Sprintf("[Error OCR en %s]\n", file)
		} else {
		
			text := string(output)
			text = regexp.MustCompile(`[©]`).ReplaceAllString(text, "")
			text = regexp.MustCompile(`\s+\n`).ReplaceAllString(text, "\n")
			finalText += text + "\n"
		}

	
		os.Remove(tmpImg)
	}

	
	os.Remove(tmpPDF)

	response["ok"] = true
	response["text"] = finalText
	fmt.Println("🎉 OCR COMPLETADO EXITOSAMENTE")
	return response
}


func (a *App) ExtractQuestions(text string) []string {	
    re := regexp.MustCompile(`(?m)^\s*\d+\s*[\.\-\):]?\s+`)
    indexes := re.FindAllStringIndex(text, -1)

    if len(indexes) == 0 {
        return []string{}
    }

    var questions []string

    for i := 0; i < len(indexes); i++ {
        start := indexes[i][0]
        var end int

        if i+1 < len(indexes) {
            end = indexes[i+1][0]
        } else {
            end = len(text)
        }

        q := strings.TrimSpace(text[start:end])

      
        q = strings.ReplaceAll(q, "\n", " ")
        q = regexp.MustCompile(`\s+`).ReplaceAllString(q, " ")

        questions = append(questions, q)
    }

    return questions
}

