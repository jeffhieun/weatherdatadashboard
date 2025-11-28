FROM golang:1.20-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go env -w GOPROXY=https://proxy.golang.org
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags='-s -w' -o /weatherd ./

FROM scratch
COPY --from=build /weatherd /weatherd
EXPOSE 8080
ENTRYPOINT ["/weatherd"]
