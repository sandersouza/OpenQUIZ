#!/bin/bash
arg=$1
VENV_DIR="venv"
REQUIREMENTS_FILE="requirements.txt"

if ! command -v python3 &> /dev/null; then
    echo "Python 3 não está instalado. Por favor, instale antes de continuar."
    exit 1
fi

function cleanup() {
    if [[ ! -d "$VENV_DIR" ]]; then
        echo "Não há ambiente virtual."
    else
        echo "Preparando desativação e apagamento do ambiente virtual python."
        deactivate=$(which deactivate | grep "deactivate ()")
        if [ ! -z "$deactivate" ]; then
            echo "Ambiente virtual inativo."
        else
            echo -n "Desativando ambiente virtual..."
            deactivate
            echo "ok."
        fi
        echo -n "Apagando ambiente virtual..."
        rm -Rf $VENV_DIR
        echo "ok."
    fi

    echo -n "Limpando os caches do python..."
    find . -name "__pycache__" -type d -exec rm {} \;
    echo "ok."
    echo "Limpeza concluída!"
}

function create() {
    if [[ ! -f "$REQUIREMENTS_FILE" ]]; then
        echo "Arquivo requirements.txt não encontrado!"
        exit 1
    fi

    # Cria ambiente virtual
    if [[ ! -d "$VENV_DIR" ]]; then
        echo -n "Criando ambiente virtual..."
        python3 -m venv "$VENV_DIR"
        echo "ok."
    fi

    echo -n "Ativando ambiente virtual..."
    source "$VENV_DIR/bin/activate"
    echo "ok."    

    # Instala as dependências
    pip freeze | grep -f "$REQUIREMENTS_FILE" >/dev/null 2>&1
    if [[ $? -ne 0 ]]; then
        echo -n "Instalando dependências do $REQUIREMENTS_FILE..."
        pip install --upgrade pip > /dev/null 2>&1
        pip install -r "$REQUIREMENTS_FILE" -q
        echo "ok."
    else
        echo "Todas as dependências já estão instaladas."
    fi

    echo -n "Verificando dependências..."
    source "$VENV_DIR/bin/activate"
    echo "ok."

    deactivate
    echo -e "Configuração concluída!\n"
    echo -e "Para ativar o ambiente, use 'source venv/bin/activate'."
}


show_help() {
    echo -e "\nUso: $0 [ create | cleanup ]"
    echo -e "\nOpções:"
    echo -e "  -h, --help      Mostra esta ajuda"
    echo -e "  create          Cria o ambiente virtual e instala as dependências (ver requirements.txt)"
    echo -e "  cleanup         Limpa o ambiente virtual e caches"
}


case "$arg" in
    create)
        create
        ;;
    cleanup)
        cleanup
        ;;
    --help)
        show_help
        exit 1
        ;;
    -h)
        show_help
        exit 1
        ;;
    *)
        if [ -z $arg ]; then
            echo "não há opção selecionada."
            show_help
        else
            echo "Opção inválida: $arg"
            show_help
        fi
        exit 1
        ;;
esac 