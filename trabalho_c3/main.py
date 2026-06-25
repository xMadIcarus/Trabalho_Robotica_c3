import os
import json
import time  # Adicionado para medir o tempo de resposta (latência)
from dotenv import load_dotenv
from groq import Groq

# 1. Carregamento seguro de credenciais
load_dotenv()
api_key = os.environ.get("GROQ_API_KEY")

if not api_key:
    raise ValueError("Erro Crítico: API Key do Groq não encontrada no arquivo .env.")

client = Groq(api_key=api_key)


def executar_pipeline_c2():
    """
    Simula a saída do seu sistema de Visão Computacional de Borda (C2).
    Captura os recortes, as classes (Vidro Verde/Metal) e a confiança.
    """
    return  {
  "timestamp": "2026-06-16T22:33:25.090Z",
  "hardware_inferencia": "Edge Computing (Navegador)",
  "limiar_confianca_configurado": 0.75,
  "objetos_detectados": [
    {
      "classe": "Metal",
      "probabilidade_confianca": 1,
      "bbox": {
        "x": 42,
        "y": 119,
        "w": 567,
        "h": 356
      }
    }
  ]
}


def analisar_dados_llm(dados_c2):
    """
    Recebe os dados da C2, monta o prompt e chama a API do Groq.
    Contém tratamento de erros, timeout e logs de consumo (Etapa 3).
    """
    # Serializa os dados em JSON de forma legível para a IA
    payload = json.dumps(dados_c2, ensure_ascii=False, indent=2)

    # Engenharia de Prompt: Definindo a Persona (System) e a Tarefa (User)
    system_prompt = (
        "Você é um engenheiro especialista em Inteligência Artificial focado em automação industrial "
        "e triagem de resíduos sólidos. Sua tarefa é analisar logs de detecção de objetos e retornar "
        "uma análise técnica e objetiva em tópicos."
    )

    user_prompt = f"""
    Analise os dados gerados pelo nosso modelo MobileNetV2 (Edge AI) abaixo.
    O sistema possui um filtro lógico que só aprova detecções com confiança >= 0.75.

    1. Verifique se as detecções atuais cumprem a regra de confiança.
    2. Aponte padrões ou anomalias.
    3. Dê uma recomendação operacional baseada nesses dados.

    Dados de entrada:
    {payload}
    """

    # Inicia o cronômetro para medir a latência
    inicio_chamada = time.time()

    try:
        # Chamada à API com os parâmetros de segurança e limite ajustado
        resposta = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=1024,  # Aumentado para evitar corte no meio da frase
            timeout=15.0  # Requisito da Etapa 3: Timeout
        )

        # Para o cronômetro e calcula o tempo gasto
        fim_chamada = time.time()
        latencia_segundos = fim_chamada - inicio_chamada

        # Extrai os dados da resposta
        tokens_usados = resposta.usage.total_tokens
        analise_texto = resposta.choices[0].message.content

        # Monta a string final concatenando a análise com o log técnico (Requisito da Etapa 3)
        log_tecnico = (
            f"\n\n{'-' * 30}\n"
            f"📊 LOG DE TELEMETRIA (API GROQ)\n"
            f"Tempo de Resposta (Latência): {latencia_segundos:.2f} segundos\n"
            f"Tokens Consumidos: {tokens_usados}\n"
            f"{'-' * 30}"
        )

        return analise_texto + log_tecnico

    except Exception as erro:
        # Resiliência: Se a internet cair ou o Groq falhar, o sistema não quebra
        return f"[AVISO CRÍTICO] Falha na comunicação com a IA. Motivo: {str(erro)}"


def main():
    # Etapa 1: Captura dos Dados da C2
    resultado_c2 = executar_pipeline_c2()

    # Apresentação Final (Dashboard no Terminal)
    print("\n" + "=" * 60)
    print("🤖 RESULTADO BRUTO DA TRIAGEM DE RESÍDUOS (C2)")
    print("=" * 60)
    print(json.dumps(resultado_c2, ensure_ascii=False, indent=2))

    print("\nProcessando análise generativa via LPU Groq...\n")

    # Etapa 2 e 3: Análise da LLM com logs (C3)
    analise_final = analisar_dados_llm(resultado_c2)

    print("=" * 60)
    print("🧠 ANÁLISE INTERPRETATIVA DA IA (C3)")
    print("=" * 60)
    print(analise_final)
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()