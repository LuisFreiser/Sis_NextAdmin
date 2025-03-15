
import { NextResponse } from 'next/server';
import { authService } from '@/app/services/authService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const usuario = await authService.login(body);
    
    return NextResponse.json(usuario);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' }, 
      { status: 401 }
    );
  }
}