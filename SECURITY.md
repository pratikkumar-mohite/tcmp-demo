# Security Best Practices

## ✅ Security Measures Implemented

### 1. **Credentials NOT in Docker Image**
- ✅ Credentials are **NOT copied** into the Docker image
- ✅ Credentials directory is created but left empty in the image
- ✅ Credentials are mounted as **read-only volumes** at runtime via docker-compose
- ✅ `.dockerignore` explicitly excludes all credential files

### 2. **Credentials NOT in Git**
- ✅ `.gitignore` excludes `backend/credentials/*.json`
- ✅ Service account JSON files are never committed to the repository
- ✅ Credentials must be provided separately (via volume mount or secrets)

### 3. **Environment Variables**
- ✅ No hardcoded passwords in Dockerfile
- ✅ `ADMIN_PASSWORD` must be provided via environment variable
- ✅ `.env` file is excluded from git (via `.gitignore`)
- ✅ `env.example` provided as a template (safe to commit)

### 4. **Docker Build Security**
- ✅ `.dockerignore` prevents sensitive files from being included
- ✅ Multi-stage build keeps final image minimal
- ✅ Only necessary files copied to final image

## 🔒 How to Use Securely

### For Local Development:
1. Create a `.env` file from `env.example`:
   ```bash
   cp env.example .env
   ```
2. Edit `.env` and set your `ADMIN_PASSWORD`
3. Ensure credentials are in `backend/credentials/` (not in git)
4. Run with docker-compose (reads `.env` automatically):
   ```bash
   docker-compose up
   ```

### For Production:
1. **Never** commit `.env` or credentials to git
2. Use Docker secrets or environment variables from your deployment platform
3. Mount credentials securely (e.g., Kubernetes secrets, Docker secrets)
4. Use strong passwords for `ADMIN_PASSWORD`
5. Consider using a secrets management service (AWS Secrets Manager, HashiCorp Vault, etc.)

## 📋 Files Excluded from Git:
- `.env` and `.env.local` files
- `backend/credentials/*.json` (service account keys)
- All sensitive credential files

## 📋 Files Excluded from Docker Image:
- `.env` files
- `backend/credentials/*.json` (service account keys)
- Test files
- Development artifacts

## ⚠️ Important Notes:
- The Docker image does **NOT** contain any credentials
- Credentials must be mounted at runtime
- Always use strong passwords in production
- Never commit `.env` files or service account JSONs

