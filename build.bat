@echo off
setlocal

docker stop email_v0.1.0_container
docker rm email_v0.1.0_container
docker rmi email_v0.1.0
call npm run build
docker build -t email_v0.1.0 .

endlocal