#!/bin/bash
# ============================================
# Script de Setup da VPS Oracle — SaaS Imobiliária
# Execute como root: sudo bash setup-vps.sh
# ============================================

set -e

echo "🚀 Iniciando setup do SaaS Imobiliária..."
echo ""

# ============================================
# 1. Atualizar o sistema
# ============================================
echo "📦 Atualizando pacotes do sistema..."
apt update && apt upgrade -y

# ============================================
# 2. Instalar Docker
# ============================================
echo "🐳 Instalando Docker..."
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu

# ============================================
# 3. Instalar Docker Compose
# ============================================
echo "🐳 Instalando Docker Compose..."
apt install -y docker-compose-plugin

# ============================================
# 4. Instalar Git
# ============================================
echo "📂 Instalando Git..."
apt install -y git

# ============================================
# 5. Abrir portas no firewall do Ubuntu
# ============================================
echo "🔥 Abrindo portas 80 e 443..."
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
netfilter-persistent save || true

# ============================================
# 6. Clonar o projeto
# ============================================
echo "📥 Clonando o projeto..."
cd /home/ubuntu
if [ -d "SaaSImobiliaria" ]; then
  echo "   Projeto já existe, fazendo pull..."
  cd SaaSImobiliaria && git pull
else
  echo "   ⚠️  Clone manual necessário. Execute:"
  echo "   git clone SEU_REPOSITORIO /home/ubuntu/SaaSImobiliaria"
  echo ""
fi

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Próximos passos:"
echo "  1. Clone ou copie o projeto para /home/ubuntu/SaaSImobiliaria"
echo "  2. Copie .env.production para .env:"
echo "     cp .env.production .env"
echo "  3. Edite o .env com suas configurações:"
echo "     nano .env"
echo "  4. Suba tudo com Docker:"
echo "     docker compose up -d --build"
echo "  5. Rode as migrations e o seed:"
echo "     docker compose exec backend npx prisma migrate deploy"
echo "     docker compose exec backend npx prisma db seed"
echo ""
echo "🎉 Acesse http://SEU_IP no navegador!"

