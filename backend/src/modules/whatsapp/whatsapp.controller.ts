import { Controller, Get, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service.js';
import { Public } from '../../common/decorators/public.decorator.js';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  /**
   * Endpoint OBRIGATÓRIO pelo Facebook/Meta para confirmar a URL do Webhook.
   * Quando você cadastra a URL no painel, eles enviam um GET com um token.
   */
  @Get('webhook')
  @Public()
  verifyWebhook(@Req() req: any, @Res() res: any) {
    const verify_token = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'SAAS_IMOBILIARIA_TOKEN';

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === verify_token) {
        // Responde com o número mágico (challenge) para confirmar que somos nós
        return res.status(HttpStatus.OK).send(challenge);
      } else {
        return res.sendStatus(HttpStatus.FORBIDDEN);
      }
    }
    return res.sendStatus(HttpStatus.BAD_REQUEST);
  }

  /**
   * Endpoint que o Meta bate para nos informar sobre status de envio e respostas.
   */
  @Post('webhook')
  @Public()
  async handleWebhookEvent(@Body() body: any, @Res() res: any) {
    // O Meta exige que respondamos 200 OK imediatamente para não re-tentar várias vezes.
    res.sendStatus(HttpStatus.OK);
    
    // Processamos os dados em background
    if (body.object === 'whatsapp_business_account') {
      await this.whatsappService.processWebhookEvent(body);
    }
  }
}

