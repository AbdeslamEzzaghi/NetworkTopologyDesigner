# Netlify Deployment Instructions

Follow these steps to deploy the Network Designer project to Netlify:

## Prerequisite: Install Netlify CLI

```bash
npm install -g netlify-cli
```

## Step 1: Update package.json

Ensure your package.json contains all the necessary dependencies and scripts:

```bash
npm install serverless-http --save
```

## Step 2: Build the Project

```bash
npm run build
```

## Step 3: Deploy to Netlify

You have two options:

### Option A: Deploy via Netlify CLI

```bash
netlify deploy
```

When prompted:
1. Select "Create & configure a new site"
2. Choose your team
3. Set a site name or let Netlify generate one
4. For the publish directory, enter "dist"
5. Confirm the deploy

Once you've verified everything looks good on the draft URL:

```bash
netlify deploy --prod
```

### Option B: Deploy via Netlify Dashboard

1. Go to [Netlify](https://app.netlify.com/)
2. Create a new site from Git
3. Connect your GitHub repository
4. Set the build command to `npm run build`
5. Set the publish directory to `dist`
6. Click "Deploy site"

## Step 4: Set Environment Variables (if needed)

If your application requires environment variables, set them in the Netlify dashboard:
1. Go to your site settings
2. Navigate to "Build & deploy" → "Environment"
3. Add your environment variables

## Troubleshooting

If you encounter deployment issues:

1. Check Netlify build logs for errors
2. Ensure all dependencies are included in package.json
3. Verify your netlify.toml configuration is correct
4. Check that API calls are properly directed to the serverless functions

## Updating Your Deployment

To update your site after making changes:

```bash
git push
```

If you've connected your Git repository, Netlify will automatically redeploy when you push changes.