
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';
import type { Video as VideoType } from '@/lib/types';

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  } catch (error) {
    console.error("Invalid URL for embedding:", url);
    return null;
  }
  return null;
}

export default async function WatchVideosPage() {
  const supabase = createClient();
  const { data: { session }} = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: videos, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    return <div>Could not load videos. Please try again later.</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-3xl">
            <Video className="h-8 w-8 text-primary" />
            Guidelines
          </CardTitle>
          <CardDescription>
            Watch helpful videos and tutorials about using the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {videos && videos.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(videos as VideoType[]).map((video) => {
                const embedUrl = getYouTubeEmbedUrl(video.url);
                return (
                  <Card key={video.id} className="overflow-hidden">
                    {embedUrl ? (
                        <div className="aspect-video">
                            <iframe
                                src={embedUrl}
                                title={video.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="h-full w-full"
                            ></iframe>
                        </div>
                    ) : (
                        <div className="aspect-video bg-muted flex items-center justify-center">
                            <p className="text-destructive text-sm p-4">Invalid video URL</p>
                        </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                <p className="text-center text-muted-foreground">
                    No videos have been uploaded yet.
                    <br />
                    Check back soon for tutorials and other content!
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
