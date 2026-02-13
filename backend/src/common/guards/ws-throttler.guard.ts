import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * WebSocket-aware throttler guard.
 * Maps the "request" to the underlying Socket.io client object so that
 * the default @nestjs/throttler can extract a stable tracker key.
 */
@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  /**
   * Adapt the WS execution context to look like an HTTP context.
   * The base ThrottlerGuard expects `request.ip` or a tracker key.
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use the authenticated userId when available, fall back to socket id
    return req?.data?.userId || req?.id || 'anonymous';
  }

  async handleRequest(
    requestProps: any,
  ): Promise<boolean> {
    // Delegate to the parent implementation which reads the @Throttle() metadata
    return super.handleRequest(requestProps);
  }

  /**
   * Allow the throttler to recognise WebSocket execution contexts.
   */
  protected getRequestResponse(context: ExecutionContext) {
    if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient();
      // Return the socket client as both request and response
      // The response just needs to be truthy for the guard to work
      return { req: client, res: client };
    }
    return super.getRequestResponse(context);
  }
}
