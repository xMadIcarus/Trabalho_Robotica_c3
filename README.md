# Detecção e Análise Inteligente de Resíduos (Edge AI + Groq LPU)

## 📌 Visão Geral do Projeto

Este repositório contém a implementação completa de um pipeline de automação voltado para a triagem de resíduos recicláveis. O projeto integra uma solução de Visão Computacional de Borda (Edge Computing) com uma camada de análise semântica utilizando modelos de linguagem (LLM) via API.

O sistema atua em duas frentes integradas:

1. **Frontend (Edge AI):** Realiza a detecção e classificação em tempo real de "Metal" e "Vidro Verde" utilizando a webcam local, gerando logs estruturados das detecções em formato JSON.

2. **Backend (Camada Analítica):** Consome os dados estruturados gerados pelo frontend e utiliza o modelo Llama via API do Groq para auditar as métricas, validar as regras de negócio lógicas e registrar a telemetria de performance.

---

## 🏗️ Arquitetura e Tecnologias

### 1. Visão Computacional (Frontend - C2)

* **MediaPipe (EfficientDet-Lite0):** Responsável por localizar objetos genéricos no feed de vídeo e extrair as coordenadas espaciais (Bounding Boxes).

* **Teachable Machine (MobileNetV2):** Atua como o classificador especialista, avaliando os recortes gerados pela detecção prévia para identificar a categoria exata do resíduo.

* **Regra de Negócio:** Filtro lógico de confiança (Confidence Score). O sistema só registra e envia a classificação se a probabilidade matemática for maior ou igual a 0.75.

* **Saída de Dados:** Exporta um payload JSON diretamente no Console do navegador contendo timestamp, hardware de inferência, classes detectadas, níveis de confiança e coordenadas espaciais.

### 2. Processamento Analítico (Backend - C3)

* **Linguagem de Programação:** Python 3

* **Integração de Infraestrutura:** Groq API (LPU Inference Engine)

* **Orquestração de Fluxo:** Recebe o payload JSON do frontend, injeta os dados em um prompt estruturado e invoca a API para análise de governança de dados.

* **Resiliência do Sistema:** Implementação de tratamento de exceções estruturado (`try/except`), timeout de rede fixado em 15 segundos para evitar travamentos e gestão segura de credenciais via variáveis de ambiente (`.env`).

* **Telemetria Real:** Log automático e exibição em terminal do consumo exato de tokens e do tempo de latência da requisição.

---

## 🧠 Configuração do Modelo e Critérios Técnicos

Para a etapa de inferência analítica, optou-se pela plataforma **Groq** devido à sua arquitetura LPU (Language Processing Unit), que garante tempo de resposta inferior a 3 segundos no pipeline completo.

* **Modelo Escolhido:** `llama-3.3-70b-versatile`

* **Justificativa de Engenharia:** A tarefa central do modelo neste projeto é a atuação como um motor de governança de dados lógicos. A leitura precisa de objetos JSON aninhados, a extração matemática de valores (probabilidades) e a validação contra regras predefinidas exigem alta capacidade de raciocínio estruturado. O modelo de 70 bilhões de parâmetros provou-se imune a alucinações numéricas durante os testes de estresse, oferecendo a estabilidade analítica que modelos menores (como variantes de 8B) não alcançaram.

* **Parâmetros Operacionais:** Configurou-se `temperature=0.2` para garantir respostas estritamente determinísticas, técnicas e baseadas exclusivamente no log fornecido. O limite de tamanho foi fixado em `max_tokens=1024` para controle de infraestrutura e prevenção de truncamento de texto.

---
