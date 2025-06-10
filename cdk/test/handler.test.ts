import { main as handler } from '../src/handler';
import * as slots from '../src/slots';
import * as soho from '../src/sohoCrm';
import * as crm from '../src/crm';

jest.mock('../src/slots');
jest.mock('../src/sohoCrm');
jest.mock('../src/crm');

test('processes message', async () => {
  (slots.loadState as jest.Mock).mockResolvedValue({ sessionId: '1', slots: {} });
  (slots.classifyIntent as jest.Mock).mockResolvedValue('soporte');
  (slots.fillSlots as jest.Mock).mockImplementation(async (state) => {
    state.completed = true;
    return 'ok';
  });
  (soho.openCase as jest.Mock).mockResolvedValue('CASE-1');
  const res = await handler({ body: 'Body=hola&From=123' } as any);
  expect(res.statusCode).toBe(200);
});
