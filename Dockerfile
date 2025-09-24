# Try different registries if Docker Hub fails
FROM node:18
# Alternative registries (uncomment if needed):
# FROM registry.hub.docker.com/library/node:18
# FROM public.ecr.aws/docker/library/node:18
# FROM quay.io/node/node:18

# If all registries fail, use Ubuntu and install Node manually:
# FROM ubuntu:20.04
# RUN apt-get update && apt-get install -y curl
# RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
# RUN apt-get install -y nodejs


WORKDIR /app

COPY package*.json ./

# Environment variables for the application
ENV VITE_SUPABASE_URL=https://himswpxnatldpsmndqlf.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbXN3cHhuYXRsZHBzbW5kcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNDYyNjIsImV4cCI6MjA1MTgyMjI2Mn0.gBI2-Vbex1brojL2Izo-FPMOWzs8buzg64oM_8FzBr0
ENV VITE_API_URL=https://api-gigsmanual.harx.ai/api
ENV VITE_REP_URL=https://api-repcreationwizard.harx.ai/api
ENV VITE_CLOUDINARY_CLOUD_NAME=dyqg8x26j
ENV VITE_CLOUDINARY_API_KEY=981166483223979
ENV VITE_CLOUDINARY_API_SECRET=i3nxRvfOF1jjfLzMHKE8mP4aXVM
ENV VITE_API_URL_ONBOARDING=https://api-companysearchwizard.harx.ai/api
ENV VITE_STANDALONE=true
ENV VITE_USER_ID=680a27ffefa3d29d628d0016
ENV VITE_COMPANY_ID=684ace43641398dc582f1acc
ENV VITE_USE_MO CK_DATA=true

RUN npm install

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 5179

CMD ["serve", "-s", "dist", "-l", "5179"]
