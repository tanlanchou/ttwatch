docker run -d --name ttwatch_v0.1.0_container -p 8109:8109 --env CONSUL_HOST=%CONSUL_HOST% --env CONSUL_TOKEN=%CONSUL_TOKEN% --restart always ttwatch_v0.1.0