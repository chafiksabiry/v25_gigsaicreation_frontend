FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

ENV VITE_SUPABASE_URL=https://himswpxnatldpsmndqlf.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbXN3cHhuYXRsZHBzbW5kcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNDYyNjIsImV4cCI6MjA1MTgyMjI2Mn0.gBI2-Vbex1brojL2Izo-FPMOWzs8buzg64oM_8FzBr0
ENV VITE_API_URL=https://api-gigsmanual.harx.ai/api
ENV VITE_CLOUDINARY_CLOUD_NAME=dyqg8x26j
ENV VITE_CLOUDINARY_API_KEY=981166483223979
ENV VITE_CLOUDINARY_API_SECRET=i3nxRvfOF1jjfLzMHKE8mP4aXVM
RUN npm install

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 5178

CMD ["serve", "-s", "dist", "-l", "5178"]
