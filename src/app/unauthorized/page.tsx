import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <p className="text-5xl font-bold text-primary">403</p>
      <h1 className="text-xl font-semibold text-foreground">Acesso negado</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Você não tem permissão para acessar esta página com o seu papel atual.
      </p>
      <Link href="/" className={buttonVariants()}>
        Voltar ao início
      </Link>
    </div>
  );
}
