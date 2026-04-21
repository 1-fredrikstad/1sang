import { Badge } from '@/components/ui/badge';
import { useTagFilter } from '../context/TagFilterContext';
import { useRouter } from 'next/navigation';
import { Tag as TagType } from '../lib/db';

interface TagProps {
  tag: TagType;
}

// Clickable tag component linking to homepage with tags activated
export default function TagComponent({ tag }: TagProps) {
  const { setSingleTag } = useTagFilter();
  const router = useRouter();

  const handleClick = () => {
    setSingleTag(tag); // Replace any existing tag filters with this one
    router.push('/'); // Navigate to homepage with new filter
  };

  return (
    <Badge
      variant="secondary"
      onClick={handleClick}
      className="p-3 mr-1 text-md hover:bg-secondary/80 transition-colors cursor-pointer"
    >
      {tag.name}
    </Badge>
  );
}
