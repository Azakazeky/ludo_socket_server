import { OnModuleInit } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';

@WebSocketGateway( 3000,
    { transports: [ 'websocket' ] }
)
export class ServerGateway implements OnModuleInit
{

    @WebSocketServer()
    server: Server;

    onModuleInit ()
    {
        this.server.on( 'connection', ( socket ) =>
        {
            console.log( socket.id, 'connected' );
            console.log( new Date() );
            socket.send( 'Welcome to the server!' );
            return socket.id;
        }
        );
    }
    @SubscribeMessage( 'connect' )
    handleConnect ( client: any, ...args: any[] )
    {
        console.log( "Client connected: ", client.id );
        console.log( new Date() );
    }

    @SubscribeMessage( 'disconnect' )
    handleDisconnect ( client: any, ...args: any[] )
    {
        console.log( "Client disconnected: ", client.id );
        console.log( new Date() );
    }

    @SubscribeMessage( 'joinRoom' )
    handleRoomJoin ( client: Socket, room: string )
    {
        client.join( room );
        console.log( "Client joined room: ", room );
        console.log( new Date() );
        client.emit( 'joinedRoom', room );
    }

    @SubscribeMessage( 'leaveRoom' )
    handleRoomLeave ( client: Socket, room: string )
    {
        client.leave( room );
        console.log( "Client left room: ", room );
        console.log( new Date() );
        client.emit( 'leftRoom', room );
    }

    @SubscribeMessage( 'onMessage' )
    handleListenMessage ( client: Socket, message: { sender: string, room: string, message: string; } )
    {
        this.server.to( message.room ).emit( 'chatToClient', message );
        console.log( 'message from ' + client.id );
    }

}