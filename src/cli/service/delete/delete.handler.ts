import { ICommandHandler, IHandlerParameters } from "@brightside/imperative";
import { RequestError, StatusCodeError } from "request-promise/errors";
import { ZosConnectService } from "../../../api/service/ZosConnectService";

export default class DeleteHandler implements ICommandHandler {
    public async process(commandParams: IHandlerParameters): Promise<void> {
        const profile = commandParams.profiles.get("zosconnect");
        try {
            await ZosConnectService.delete(profile, commandParams.arguments.serviceName, true);
            commandParams.response.console.log(`Successfully deleted Service ${commandParams.arguments.serviceName}`);
        } catch (error) {
            switch (error.constructor) {
                case StatusCodeError:
                    const statusCodeError = error as StatusCodeError;
                    switch (statusCodeError.statusCode) {
                        case 401:
                        case 403:
                            commandParams.response.console.error(
                                "Security error occurred when trying to delete the Service");
                            break;
                        case 404:
                            commandParams.response.console.error(
                                `Service ${commandParams.arguments.serviceName} is not installed.`);
                            break;
                        default:
                            commandParams.response.console.error(statusCodeError.message);
                    }
                    break;
                case RequestError:
                    commandParams.response.console.error(`Unable to connect to ${profile.name}`);
                    break;
                default:
                    commandParams.response.console.error(error);
            }
        }
    }
}
