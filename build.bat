@echo off
setlocal

docker stop ttwatch_v0.1.0_container
docker rm ttwatch_v0.1.0_container
docker rmi ttwatch_v0.1.0
call npm run build
docker build -t ttwatch_v0.1.0 .

endlocal