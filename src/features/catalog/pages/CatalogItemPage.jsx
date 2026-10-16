import { useParams } from 'react-router-dom';
import { FeaturePlaceholder } from '../../../components/ui/FeaturePlaceholder.jsx';

export function CatalogItemPage() {
  const { itemId } = useParams();
  return (
    <FeaturePlaceholder
      title="Detail barang"
      description={`Informasi barang ${itemId} akan dimuat dari layanan katalog.`}
    />
  );
}
