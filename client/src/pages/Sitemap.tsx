export default function Sitemap() {
  const { data: properties } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: () => fetch('/api/properties?pageSize=1000').then(res => res.json())
  });

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: () => fetch('/api/projects?pageSize=100').then(res => res.json())
  });
}