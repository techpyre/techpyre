#!/bin/bash

# Interrompe lo script in caso di errori
set -e

# 1. Chiedi il nome della repository (default: nome della cartella corrente)
CURRENT_DIR=$(basename "$PWD")
read -p "Nome repository GitHub [$CURRENT_DIR]: " REPO_NAME
REPO_NAME=${REPO_NAME:-$CURRENT_DIR}

# 2. Visibilità del repository (public o private)
read -p "Vuoi che sia 'public' o 'private'? [public]: " VISIBILITY
VISIBILITY=${VISIBILITY:-public}

echo ""
echo "🚀 Avvio procedura per: $REPO_NAME ($VISIBILITY)"
echo "-----------------------------------------------"

# 3. Inizializzazione Git locale (se non già presente)
if [ ! -d ".git" ]; then
    echo "📦 Inizializzazione Git locale..."
    git init -b main
else
    echo "ℹ️ Repository Git locale già presente."
fi

# Crea un .gitignore di base se non esiste
if [ ! -f ".gitignore" ]; then
    echo "node_modules" >> .gitignore
    echo ".vercel" >> .gitignore
    echo ".env*" >> .gitignore
    echo "📄 Creato .gitignore di base"
fi

# 4. Commit dei file
echo "💾 Creazione commit iniziale..."
git add .
# Esegue il commit solo se ci sono modifiche da salvare
git diff --cached --quiet || git commit -m "Initial commit auto-generated"

# 5. Creazione repository su GitHub e Push
echo "🐙 Creazione e push su GitHub..."
# Controlla se la repository remota esiste già
if ! git remote | grep -q "origin"; then
    gh repo create "$REPO_NAME" --"$VISIBILITY" --source=. --remote=origin --push
else
    echo "ℹ️ Il remote 'origin' esiste già. Faccio solo il push..."
    git push -u origin main
fi

# 6. Deploy su Vercel in Produzione
echo ""
echo "▲ Avvio deploy su Vercel..."
# Il flag --yes salta le conferme interattive usando i parametri standard
vercel --prod --yes

echo ""
echo "✅ Tutto completato con successo!"