import { apiSuccess } from '@/lib/api/response';

export async function POST() {
  const response = apiSuccess({ message: 'Successfully logged out' });
  response.cookies.delete('scoreedge_token');
  return response;
}
