# My AWS React App

A simple task manager web application built with React and TypeScript, ready for deployment on AWS.

## Features

- ✅ Built with React 18 and TypeScript
- ✅ Task management functionality (add, complete, delete)
- ✅ Modern, responsive UI
- ✅ Production-ready build configuration
- ✅ AWS deployment ready

## Local Development

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm start
```

The app will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## AWS Deployment Options

### Option 1: AWS Amplify (Recommended - Easiest)

AWS Amplify is the simplest way to deploy React apps.

1. **Push code to Git repository** (GitHub, GitLab, or Bitbucket)

2. **Deploy via AWS Amplify Console:**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your Git repository
   - Amplify will auto-detect the build settings
   - Click "Save and deploy"

3. **Amplify will automatically:**
   - Install dependencies
   - Build your app
   - Deploy to a global CDN
   - Provide a URL for your app
   - Set up CI/CD for automatic deployments

### Option 2: Amazon S3 + CloudFront

Host your static site on S3 with CloudFront CDN.

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Create an S3 bucket:**
   ```bash
   aws s3 mb s3://my-react-app-bucket
   ```

3. **Upload build files:**
   ```bash
   aws s3 sync build/ s3://my-react-app-bucket --acl public-read
   ```

4. **Enable static website hosting:**
   - Go to S3 bucket → Properties → Static website hosting
   - Enable it and set index document to `index.html`

5. **Optional: Set up CloudFront for CDN:**
   - Create CloudFront distribution
   - Set origin to S3 bucket
   - Configure caching and SSL

### Option 3: AWS Elastic Beanstalk

Deploy with managed infrastructure.

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize Elastic Beanstalk:**
   ```bash
   eb init -p node.js my-aws-app
   ```

3. **Create environment and deploy:**
   ```bash
   eb create production
   eb deploy
   ```

### Option 4: AWS App Runner

Container-based deployment.

1. **Create a Dockerfile** (if needed)
2. Push to Amazon ECR or GitHub
3. Create App Runner service from AWS Console
4. App Runner automatically builds and deploys

### Option 5: Manual S3 Upload

Quick deployment without CLI:

1. Run `npm run build`
2. Go to AWS S3 Console
3. Create a new bucket
4. Upload contents of `build/` folder
5. Enable static website hosting
6. Make bucket public (or use CloudFront)

## Build Configuration

The project includes:

- **buildspec.yml**: AWS CodeBuild configuration
- **package.json**: Dependencies and scripts
- **tsconfig.json**: TypeScript configuration

## Environment Variables

For production deployments, you can add environment variables:

**Amplify:**
- Add in Amplify Console → Environment variables

**S3/CloudFront:**
- Build with: `REACT_APP_API_URL=https://api.example.com npm run build`

**Elastic Beanstalk:**
- Configure in `.ebextensions` or EB Console

## Cost Considerations

- **Amplify**: Free tier: 1000 build minutes/month, 15GB storage
- **S3 + CloudFront**: Pay per storage and data transfer (very cheap for small apps)
- **Elastic Beanstalk**: Charged for EC2 instances (~$10-20/month minimum)

## Tech Stack

- React 18
- TypeScript 5
- React Scripts 5
- CSS3

## Project Structure

```
my-aws-app/
├── public/
│   └── index.html
├── src/
│   ├── App.tsx          # Main app component
│   ├── App.css          # App styles
│   ├── index.tsx        # Entry point
│   └── index.css        # Global styles
├── buildspec.yml        # AWS CodeBuild config
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
