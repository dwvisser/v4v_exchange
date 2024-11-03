# Build:
#    docker build -t v4v-exchange .
# Run:
#    docker run -it --rm -p 3000:3000 v4v-exchange
FROM lipanski/docker-static-website:latest
COPY . .