
import { NextResponse } from 'next/server';
import { authService } from '@/app/services/authService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nuevoUsuario = await authService.registrar(body);
    
    return NextResponse.json(nuevoUsuario, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' }, 
      { status: 400 }
    );
  }
}