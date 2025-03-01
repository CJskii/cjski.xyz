---
title: "Docker Start"
date: "2025-02-16"
excerpt: "A test article in Markdown format."
---

### 🔍 **List Downloaded Images**

```
docker images
```

- Shows all the images you've downloaded.

### 🛑 **List Running Containers**

```
docker ps
```

- Shows currently running containers.

### 📜 **List All Containers (Including Stopped)**

```
docker ps -a
```

### 🗑️ **Remove a Container**

```
docker stop <container_id>
docker rm <container_id>
```

### 🗑️ **Remove an Image**

```
docker rmi <image_id>
```

📄 **Create a Folder & Dockerfile**

```
# Use Ubuntu as the base image
FROM ubuntu

# Install some utilities
RUN apt update && apt install -y curl

# Set a default command
CMD ["echo", "Hello from my custom image!"]
```

### 🔨 **Build the Image**

```
docker build -t my-ubuntu .
```

### 🚀 **Run the Custom Container**

```
docker run my-ubuntu
```

It should output:

`Hello from my custom image!`

# Networking

### 🔌 **Run an Nginx Container**

```
docker run -d -p 8080:80 nginx
```

- This runs **Nginx** on port **8080**.
- Open a browser and visit **http://localhost:8080** to see the default Nginx page.

## 🎯 **Using Volumes (Persistent Data)**

Docker containers are **ephemeral** (data is lost when stopped). Let’s use volumes.

### 📦 **Run a Container with a Volume**

```
docker run -d -p 8080:80 -v $(pwd)/my-html:/usr/share/nginx/html nginx
```

- This maps your `my-html` folder to Nginx's default website folder.
- Changes in your `my-html` folder will reflect in the container.

## 🎯 Docker Compose (Multiple Containers)\*\*

Docker Compose is used to run multiple containers.

### 📄 **Create a `docker-compose.yml` File**

```
nano docker-compose.yml
```

Add:

```
version: '3'
services:
  web:
    image: nginx
    ports:
      - "8080:80"

```

### 🚀 **Run Docker Compose**

```
docker-compose up -d
```

- This will start **Nginx** using **Docker Compose**.

### 🛑 **Stop All Services**

```
docker-compose down
```

---

## 🎯 Cleanup Unused Containers & Images\*\*

```
docker system prune -a
```

This will remove unused containers, images, and volumes.
