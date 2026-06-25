# Trabalho_Robotica_c
Detecção e Análise Inteligente de Resíduos (Edge AI + Groq LPU) ♻️🤖
Este repositório contém a implementação completa de um pipeline de inteligência artificial voltado para a triagem automatizada de resíduos recicláveis. O projeto integra uma solução de Visão Computacional de Borda (Edge Computing) com uma camada de análise semântica utilizando IA Generativa (LLM) via API.

O sistema atua em duas frentes:

    Frontend (Edge AI): Realiza a detecção e classificação em tempo real de "Metal" e "Vidro Verde" utilizando a webcam local, gerando logs estruturados das detecções.

    Backend (GenAI): Consome os dados gerados pelo frontend e utiliza um modelo de linguagem de grande escala (LLM) para auditar as métricas, validar regras de negócio lógicas e gerar telemetria de performance.

Visão Computacional
MediaPipe (EfficientDet-Lite0): Responsável por localizar objetos genéricos no feed de vídeo e extrair as Bounding Boxes.Teachable Machine (MobileNetV2): Atua como o classificador especialista, avaliando os recortes gerados pela detecção prévia.Regra de Negócio: Filtro lógico de confiança (Confidence Score). O sistema só registra a classificação se a probabilidade for $\ge 0.75$.Saída: Exporta um payload JSON diretamente no Console do navegador contendo timestamp, hardare de inferência, classes, níveis de confiança e coordenadas espaciais.
