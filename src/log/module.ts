import { Module } from '@nestjs/common';
import { LogService } from './service';
import { LogController } from './controller';
import { ClientsModule } from '@nestjs/microservices';
import listen_microservice from "src/common/helper/listenMicroservice";
import { ConfigService } from "src/common/config/config.service";

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: "MICROSERVICE_LOG_CLIENT",
                useFactory: listen_microservice("micLog"),
                inject: [ConfigService],
            },
        ])
    ],
    providers: [LogService],
    controllers: [LogController],
    exports: [LogService],
})
export class LogModule { }
