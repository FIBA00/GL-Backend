#!/bin/bash

# set -e

# cd "$(dirname "$0")"


IMAGE_BACKEND="fraolbmax/guzolink-backend:latest"
IMAGE_FRONTEND="fraolbmax/guzolink-frontend:latest"

function pause() {
    read -p "Press Enter to continue..."
}

function build() {
    
    echo "======================================"
    echo "Building Docker Images..."
    echo "======================================"

    docker compose -f docker-compose.build.yml build
    pause
}

function run_local() {
    echo "======================================"
    echo "Starting Local Environment..."
    echo "======================================"

    docker compose -f docker-compose.build.yml down
    docker compose -f docker-compose.build.yml up --build
}

function push() {
    
    echo "======================================"
    echo "Pushing Images..."
    echo "======================================"

    docker push $IMAGE_BACKEND
    docker push $IMAGE_FRONTEND

    pause
}

function pull() {
    
    echo "======================================"
    echo "Pulling Latest Images..."
    echo "======================================"

    docker compose pull

    pause
}

function start_prod() {
    
    docker compose up -d

    pause
}

function stop_all() {
    
    docker compose down

    pause
}

function logs() {
    
    docker compose logs -f
}

while true
do
    

    echo "========================================"
    echo "      GUZOLINK DEPLOYMENT TOOL"
    echo "========================================"
    echo ""
    echo "1) Build Images"
    echo "2) Run Locally"
    echo "3) Push Images"
    echo "4) Pull Images"
    echo "5) Start Production"
    echo "6) Stop Containers"
    echo "7) View Logs"
    echo "0) Exit"
    echo ""

    read -p "Select option: " OPTION

    case $OPTION in
        1) build ;;
        2) run_local ;;
        3) push ;;
        4) pull ;;
        5) start_prod ;;
        6) stop_all ;;
        7) logs ;;
        0) exit ;;
        *) echo "Invalid option"; pause ;;
    esac
done