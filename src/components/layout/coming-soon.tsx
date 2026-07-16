import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex min-h-40 items-center justify-center p-10 text-sm text-muted-foreground">
          Módulo em construção.
        </CardContent>
      </Card>
    </div>
  );
}
