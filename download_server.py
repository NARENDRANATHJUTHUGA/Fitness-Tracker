#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse, parse_qs

class DownloadHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/download':
            # Serve the fitness tracker project file
            file_path = '/app/fitness-tracker-project.tar.gz'
            if os.path.exists(file_path):
                self.send_response(200)
                self.send_header('Content-Type', 'application/gzip')
                self.send_header('Content-Disposition', 'attachment; filename="fitness-tracker-complete.tar.gz"')
                self.send_header('Content-Length', str(os.path.getsize(file_path)))
                self.end_headers()
                
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_error(404, 'File not found')
        else:
            # Serve a simple download page
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            
            html = '''
            <!DOCTYPE html>
            <html>
            <head>
                <title>FitTracker Project Download</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                    .download-btn { background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                    .download-btn:hover { background: #0056b3; }
                    .file-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <h1>🏋️ FitTracker Project Download</h1>
                <p>Your complete fitness tracking web application is ready for download!</p>
                
                <div class="file-info">
                    <h3>📦 Package Contents:</h3>
                    <ul>
                        <li>Complete Next.js application with Supabase integration</li>
                        <li>Beautiful landing page + authentication + dashboard</li>
                        <li>Workout tracking, goal setting, and progress analytics</li>
                        <li>All components, utilities, and configuration files</li>
                        <li>Database schema and setup instructions</li>
                    </ul>
                    <p><strong>File Size:</strong> ~41KB (compressed)</p>
                </div>
                
                <a href="/download" class="download-btn">📥 Download FitTracker Project</a>
                
                <h3>🚀 Setup Instructions:</h3>
                <ol>
                    <li>Extract the tar.gz file: <code>tar -xzf fitness-tracker-complete.tar.gz</code></li>
                    <li>Navigate to project directory: <code>cd fitness-tracker/</code></li>
                    <li>Install dependencies: <code>yarn install</code></li>
                    <li>Update .env with your Supabase credentials</li>
                    <li>Run the development server: <code>yarn dev</code></li>
                </ol>
                
                <p><em>Make sure your Supabase database tables are set up using the SQL queries provided!</em></p>
            </body>
            </html>
            '''
            self.wfile.write(html.encode())

if __name__ == "__main__":
    PORT = 8080
    with socketserver.TCPServer(("", PORT), DownloadHandler) as httpd:
        print(f"Download server running at http://localhost:{PORT}")
        httpd.serve_forever()