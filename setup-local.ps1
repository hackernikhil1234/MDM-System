Write-Host "MDM Portal: Local Environment Setup" -ForegroundColor Green
Write-Host "===================================="

# Check for Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Please install Node.js (v18+) first." -ForegroundColor Red
    exit 1
}

# 1. Setup Backend
Write-Host "`n📁 Setting up Backend..." -ForegroundColor Yellow
cd backend
if (!(Test-Path node_modules)) {
    Write-Host "📦 Installing backend dependencies..."
    npm install
}

if (!(Test-Path .env)) {
    Write-Host "📄 Creating backend .env..."
    $jwtSecret = [Guid]::NewGuid().ToString()
    @"
PORT=5000
MONGO_URI=mongodb://localhost:27017/mdm_system
REDIS_URL=redis://localhost:6379
JWT_SECRET=$jwtSecret
JWT_EXPIRE=7d
NODE_ENV=development
INITIAL_ADMIN_EMAIL=admin@mdmportal.com
INITIAL_ADMIN_PASSWORD=Admin@123456!
"@ | Out-File -FilePath .env -Encoding UTF8
}
cd ..

# 2. Setup Frontend
Write-Host "`n📁 Setting up Frontend..." -ForegroundColor Yellow
cd frontend
if (!(Test-Path node_modules)) {
    Write-Host "📦 Installing frontend dependencies..."
    npm install
}

if (!(Test-Path .env)) {
    Write-Host "📄 Creating frontend .env..."
    @"
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
"@ | Out-File -FilePath .env -Encoding UTF8
}
cd ..

Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "`nTo start the project:" -ForegroundColor Cyan
Write-Host "1. Start MongoDB & Redis locally."
Write-Host "2. Run 'npm run dev' in /backend"
Write-Host "3. Run 'npm start' in /frontend"

Write-Host "`nDefault Admin Credentials:" -ForegroundColor Yellow
Write-Host "Email: admin@mdmportal.com"
Write-Host "Password: Admin@123456!"
