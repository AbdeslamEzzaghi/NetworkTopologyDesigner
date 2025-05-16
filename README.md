# Network Designer

A comprehensive educational web application that enables students to create detailed network diagrams through an intuitive drag-and-drop interface with advanced device and connection modeling capabilities.

![Network Designer Screenshot](screenshot.png)

## Features

- Drag and drop device placement
- Multiple connection types (Wired, Wireless, RJ11, RJ45, Fiber, etc.)
- Adjustable wireless coverage with realistic distance units (meters)
- Device resizing capabilities 
- Floor plan backgrounds
- Export diagrams as images or PDFs
- Responsive design that works on desktops and tablets
- Undo/redo functionality
- Multi-language support (English, French)

## Technologies Used

### Frontend
- React 18 with TypeScript
- Konva.js for interactive canvas rendering
- TailwindCSS for styling
- ShadCN UI components
- React Query for data management
- Zod for type validation
- Material Icons for device representations

### Backend
- Node.js with Express
- In-memory storage with option to connect to PostgreSQL

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/network-designer.git
cd network-designer
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```
This will start both the Express backend and the React frontend using Vite.

4. Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
network-designer/
├── client/                # Frontend code
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── pages/         # Page components
│   │   └── types/         # TypeScript type definitions
├── server/                # Backend code
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage layer
├── shared/                # Shared code between client and server
│   └── schema.ts          # Data schema definitions
└── README.md              # This file
```

## Usage

### Creating a Network Diagram

1. **Add Devices**: Drag and drop devices from the left sidebar onto the canvas
2. **Connect Devices**: 
   - Select a connection type from the sidebar
   - Click on the source device, then the target device to create a connection
3. **Edit Devices and Connections**:
   - Double-click on a device to rename it
   - Right-click on a device to resize it or adjust wireless coverage range
   - Right-click on a connection to remove it
4. **Use the Tools Panel**:
   - Undo/Redo actions
   - Zoom in/out to see more or less detail
   - Clear the canvas to start over
   - Export your diagram

### Scale and Measurements

- The application uses meters as the unit of measurement
- The scale bar at the bottom left of the canvas shows distance reference
- Wireless coverage is displayed in meters (default is 20m)
- 10 pixels on screen = 1 meter in the diagram

## Deployment

This application consists of both a frontend (React/Vite) and a backend (Express). Here are detailed instructions for deploying to different platforms:

### Deploying to Replit

The simplest way to deploy this application is using Replit:

1. Click the "Deploy" button at the top of your Replit project
2. Follow the prompts to complete the deployment
3. Your application will be available at a `.replit.app` domain

### Deploying to Vercel

For this specific project structure, you'll need to deploy the frontend and backend separately:

#### Frontend Deployment:
1. Create a new folder for the frontend deployment
   ```bash
   mkdir vercel-deploy
   cd vercel-deploy
   ```

2. Initialize a new package.json
   ```bash
   npm init -y
   ```

3. Install needed dependencies
   ```bash
   npm install vite @vitejs/plugin-react typescript
   ```

4. Copy your client directory and vite.config.ts
   ```bash
   cp -r ../client ./
   cp ../vite.config.ts ./
   ```

5. Add a build script to package.json
   ```json
   "scripts": {
     "build": "vite build"
   }
   ```

6. Create a vercel.json file
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://your-backend-url.com/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

7. Deploy with Vercel
   ```bash
   npx vercel
   ```

#### Backend Deployment:
1. Deploy your Express backend to a platform like Railway, Render, or Heroku
2. Update the API URL in your frontend Vercel deployment to point to your backend

### Deploying to Netlify

Netlify works great for the frontend portion of the application. For the full-stack deployment:

1. Prepare your project for deployment:
   ```bash
   # Create a netlify.toml file in the root directory
   touch netlify.toml
   ```

2. Add the following to netlify.toml:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
     functions = "netlify/functions"

   [dev]
     command = "npm run dev"
     port = 5000

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. Create a netlify/functions directory and add a server.js function:
   ```bash
   mkdir -p netlify/functions
   touch netlify/functions/server.js
   ```

4. Convert your Express server to a Netlify function:
   ```javascript
   // netlify/functions/server.js
   const express = require('express');
   const serverless = require('serverless-http');
   
   const app = express();
   
   // Import your routes
   const routes = require('../../server/routes');
   
   // Setup routes
   app.use(express.json());
   app.use('/api', routes);
   
   // Export the serverless function
   module.exports.handler = serverless(app);
   ```

5. Install the serverless-http package:
   ```bash
   npm install serverless-http
   ```

6. Deploy to Netlify:
   ```bash
   # Using Netlify CLI
   npm install -g netlify-cli
   netlify deploy
   ```

7. Alternatively, connect your GitHub repository to Netlify through their web interface

### Deploying to Railway or Render

These platforms support full-stack applications out of the box:

1. Connect your GitHub repository
2. Set the build command to `npm run build`
3. Set the start command to `NODE_ENV=production node server/index.js`
4. Configure environment variables as needed

### Environment Variables

The following environment variables can be set for production:

- `NODE_ENV`: Set to `production` for production builds
- `DATABASE_URL`: (Optional) PostgreSQL connection string if using a database

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Konva.js](https://konvajs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.com/)
- [Material Icons](https://fonts.google.com/icons)