#!/bin/bash
arg=$1
currdir=$(pwd)
venv_dir="venv"
requirements_file="requirements.txt"

if ! command -v python3 &> /dev/null; then
    echo "Python 3 não está instalado. Por favor, instale antes de continuar."
    exit 1
fi

function cleanup() {
    cd $workdir
    if [[ -d '$venv_dir' ]]; then
        echo "Não há ambiente virtual."
    else
        echo "Preparando desativação e apagamento do ambiente virtual python."

    env_status=$(which deactivate | grep "deactivate ()")
    if [[ -n "$env_status" ]]; then
        echo "Ambiente virtual ativo. Desativando..."
        deactivate
        echo "ok."
    else
        echo "Ambiente virtual já está inativo."
    fi

        echo -n "Apagando ambiente virtual..."
        rm -Rf $venv_dir
        echo "ok."
    fi

    echo -n "Limpando os caches do python..."
    find . -type d -name "__pycache__" -depth -exec rm -r {} +
    echo "ok."
    echo "Limpeza concluída!"
    cd $currdir
}

function create() {
    cd $workdir
    if [[ ! -f "$requirements_file" ]]; then
        echo "Arquivo requirements.txt não encontrado!"
        exit 1
    fi

    # Cria ambiente virtual
    if [[ ! -d "$venv_dir" ]]; then
        echo -n "Criando ambiente virtual..."
        python3 -m venv "$venv_dir"
        echo "ok."
    fi

    echo -n "Ativando ambiente virtual..."
    source "$venv_dir/bin/activate"
    echo "ok."    

    # Instala as dependências
    pip freeze | grep -f "$requirements_file" >/dev/null 2>&1
    if [[ $? -ne 0 ]]; then
        echo -n "Instalando dependências do $requirements_file..."
        pip install --upgrade pip > /dev/null 2>&1
        pip install -r "$requirements_file" -q
        echo "ok."
    else
        echo "Todas as dependências já estão instaladas."
    fi

    echo -n "Verificando dependências..."
    source "$venv_dir/bin/activate"
    echo "ok."

    deactivate
    echo -e "Configuração concluída!\n"
    echo -e "Para ativar o ambiente, use 'source venv/bin/activate'."
    cd $currdir
}


show_help() {
    echo -e "\nUso: $0 [ create | cleanup ]"
    echo -e "\nOpções:"
    echo -e "  -h, --help      Mostra esta ajuda"
    echo -e "  -d              Define o diretório de trabalho ( workdir )"
    echo -e "  create          Cria o ambiente virtual e instala as dependências (ver requirements.txt)"
    echo -e "  cleanup         Limpa o ambiente virtual e caches"
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        -d)
            workdir=$2
            ;;
        *)
            workdir=$currdir
            ;;
    esac
done

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