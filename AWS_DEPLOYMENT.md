# AWS Deployment Quick Start Guide

## Fastest Method: AWS Amplify (5 minutes)

### Step 1: Push to GitHub
```bash
cd my-aws-app
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy on AWS Amplify
1. Log into AWS Console
2. Go to AWS Amplify service
3. Click "New app" → "Host web app"
4. Choose GitHub (or your Git provider)
5. Authorize AWS Amplify to access your repository
6. Select your repository and branch
7. Click "Save and deploy"

**That's it!** Amplify will automatically:
- Detect it's a React app
- Run `npm install` and `npm run build`
- Deploy to a CDN
- Give you a URL like: `https://main.d1234567890.amplifyapp.com`

### Continuous Deployment
Any push to your `main` branch will automatically trigger a new build and deployment!

---

## Alternative: S3 Static Hosting (Manual)

### Step 1: Build the App
```bash
npm install
npm run build
```

### Step 2: Create S3 Bucket
1. Go to AWS S3 Console
2. Click "Create bucket"
3. Name it (e.g., `my-react-app-2026`)
4. Uncheck "Block all public access"
5. Click "Create bucket"

### Step 3: Upload Files
1. Open your bucket
2. Click "Upload"
3. Drag all files from the `build/` folder
4. Click "Upload"

### Step 4: Enable Website Hosting
1. Go to bucket "Properties" tab
2. Scroll to "Static website hosting"
3. Click "Edit"
4. Enable it
5. Set Index document: `index.html`
6. Set Error document: `index.html`
7. Save changes

### Step 5: Make Public
1. Go to "Permissions" tab
2. Click "Bucket Policy"
3. Add this policy (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

### Step 6: Access Your Site
Your website URL will be shown in the Static website hosting section, like:
`http://my-react-app-2026.s3-website-us-east-1.amazonaws.com`

---

## Adding a Custom Domain

### For Amplify:
1. In Amplify Console → Domain management
2. Click "Add domain"
3. Follow the DNS configuration steps

### For S3 + CloudFront:
1. Create CloudFront distribution pointing to S3
2. Request SSL certificate in AWS Certificate Manager
3. Update Route 53 or your DNS provider

---

## Costs

**AWS Amplify:**
- Free tier: 1000 build minutes/month, 15GB served, 5GB storage
- Beyond free tier: ~$0.01 per build minute, ~$0.15/GB served

**S3 + CloudFront:**
- S3: ~$0.023/GB stored, ~$0.09/GB transferred
- CloudFront: First 1TB/month free in first year
- Typical small app: <$1/month

---

## Troubleshooting

**Build fails on Amplify:**
- Check build logs in Amplify Console
- Ensure Node.js version is compatible (16+)

**S3 website shows Access Denied:**
- Check bucket policy is applied
- Ensure all files are publicly readable

**React Router not working:**
- Set error document to `index.html` in S3
- Add redirect rules in Amplify Console

---

## Next Steps

1. Set up environment variables for API endpoints
2. Configure custom domain
3. Set up monitoring with CloudWatch
4. Add SSL certificate for HTTPS
5. Configure CI/CD pipeline
