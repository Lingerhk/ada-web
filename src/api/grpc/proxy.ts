

import {
    GrpcStatusCode,
    GrpcWebFetchTransport,
    GrpcWebFrame,
    GrpcWebOptions,
    createGrpcWebRequestBody,
    createGrpcWebRequestHeader,
    readGrpcWebResponseBody,
    readGrpcWebResponseHeader,
    readGrpcWebResponseTrailer
} from '@protobuf-ts/grpcweb-transport';

import {
    ClientStreamingCall,
    Deferred,
    DuplexStreamingCall,
    MethodInfo,
    RpcError,
    RpcMetadata,
    RpcOptions,
    RpcOutputStreamController,
    RpcStatus,
    RpcTransport,
    ServerStreamingCall,
    UnaryCall,
    mergeRpcOptions
} from "@protobuf-ts/runtime-rpc";

import { Local, Session } from '/@/utils/storage';


export class ProxyGrpcWebFetchTransport extends GrpcWebFetchTransport {
    unary<I extends object, O extends object>(
        method: MethodInfo<I, O>,
        input: I,
        options: RpcOptions
    ): UnaryCall<I, O> {
        // source code: https://github.com/timostamm/protobuf-ts/blob/bbda0c30ecc8e826c07a41105e93e05dbb9638b2/packages/grpcweb-transport/src/grpc-web-transport.ts
        // proxy origin unary behaviours:
        //   1. append "-web" to response header field "content-type".
        //   2. remove some checking codes after "readGrpcWebResponseBody".
        let
            opt = options as GrpcWebOptions,
            format = opt.format ?? 'text',
            fetchInit = opt.fetchInit ?? {},
            url = this.makeUrl(method, opt),
            inputBytes = method.I.toBinary(input, opt.binaryOptions),
            defHeader = new Deferred<RpcMetadata>(),
            maybeMessage: O | undefined,
            defMessage = new Deferred<O>(),
            maybeStatus: RpcStatus | undefined,
            defStatus = new Deferred<RpcStatus>(),
            maybeTrailer: RpcMetadata | undefined,
            defTrailer = new Deferred<RpcMetadata>();

        globalThis.fetch(url, {
            ...fetchInit,
            method: 'POST',
            headers: createGrpcWebRequestHeader(new globalThis.Headers(), format, opt.timeout, opt.meta),
            body: createGrpcWebRequestBody(inputBytes, format),
            signal: options.abort ?? null // node-fetch@3.0.0-beta.9 rejects `undefined`
        })
            .then(fetchResponse => {
                let [code, detail, meta] = readGrpcWebResponseHeader(fetchResponse);
                defHeader.resolve(meta);
                if (code != null && code !== GrpcStatusCode.OK)
                    throw new RpcError(detail ?? GrpcStatusCode[code], GrpcStatusCode[code], meta);
                if (code != null)
                    maybeStatus = {
                        code: GrpcStatusCode[code],
                        detail: detail ?? GrpcStatusCode[code]
                    };
                return fetchResponse;
            })
            .then(fetchResponse => {
                if (!fetchResponse.body)
                    throw new RpcError('missing response body', GrpcStatusCode[GrpcStatusCode.INTERNAL]);
                return readGrpcWebResponseBody(fetchResponse.body!, fetchResponse.headers.get('content-type')+'-web', (type, data) => {
                    switch (type) {
                        case GrpcWebFrame.DATA:
                            if (maybeMessage)
                                throw new RpcError(`unary call received 2nd message`, GrpcStatusCode[GrpcStatusCode.DATA_LOSS]);
                            maybeMessage = method.O.fromBinary(data, opt.binaryOptions);
                            break;
                        case GrpcWebFrame.TRAILER:
                            let code, detail;
                            [code, detail, maybeTrailer] = readGrpcWebResponseTrailer(data);
                            maybeStatus = {
                                code: GrpcStatusCode[code],
                                detail: detail ?? GrpcStatusCode[code]
                            };
                            break;
                    }
                });
            })
            .then(() => {
                // bug: https://github.com/timostamm/protobuf-ts/issues/232
                if (!maybeMessage)
                    throw new RpcError(maybeStatus?.code || 'unknown', maybeStatus?.code || '', maybeTrailer);
                defMessage.resolve(maybeMessage);
                if (maybeStatus && maybeStatus.code !== 'OK')
                    throw new RpcError(maybeStatus.detail, maybeStatus.code, maybeTrailer);
                defStatus.resolve(maybeStatus || { code: 'OK', detail: ''});
                defTrailer.resolve(maybeTrailer || {});
            })
            .catch(reason => {
                let error: RpcError;
                if (reason instanceof RpcError)
                    error = reason;
                else if (reason instanceof Error && reason.name === 'AbortError')
                    // aborted
                    error = new RpcError(reason.message, GrpcStatusCode[GrpcStatusCode.CANCELLED]);
                else
                    // RpcErrors are thrown by us, everything else is an internal error
                    error = new RpcError(reason instanceof Error ? reason.message : "" + reason, GrpcStatusCode[GrpcStatusCode.INTERNAL]);
                error.methodName = method.name;
                error.serviceName  = method.service.typeName;

                // TODO: don't do this if current url is `/login`
                if (error.code === 'UNAUTHENTICATED') {
                    // Clear cached state, tokens, and related data
                    Session.clear();
                    Local.clear();
                    Local.set("errmsg", decodeURIComponent(error.message));
                    // When using reload, you do not need to call resetRoute()
                    window.location.reload();
                }

                defHeader.rejectPending(error);
                defMessage.rejectPending(error);
                defStatus.rejectPending(error);
                defTrailer.rejectPending(error);
            });

        return new UnaryCall<I, O>(
            method,
            opt.meta ?? {},
            input,
            defHeader.promise,
            defMessage.promise,
            defStatus.promise,
            defTrailer.promise,
        );
    }
};