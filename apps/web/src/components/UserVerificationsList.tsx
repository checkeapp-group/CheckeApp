'use client';

import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UiSelect as Select } from '@/components/ui/select';
import { useI18n } from '@/hooks/use-i18n';
import { orpc } from '@/utils/orpc';
import Loader from './loader';
import UserVerificationCard from './UserVerificationCard';

export default function UserVerificationsList() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const initialSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const { data, isLoading, error } = useQuery({
    queryKey: orpc.getVerifications.key({
      input: {
        page,
        limit,
        sortBy,
        sortOrder,
        search: debouncedSearchTerm,
      },
    }),
    queryFn: () =>
      orpc.getVerifications.call({
        page,
        limit,
        sortBy,
        sortOrder,
        search: debouncedSearchTerm,
      }),
  });

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', newSortBy);
    params.set('sortOrder', newSortOrder);
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', e.target.value);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const sortOptions = useMemo(
    () => [
      { value: 'createdAt-desc', label: t('verifications.sort.newest') },
      { value: 'createdAt-asc', label: t('verifications.sort.oldest') },
    ],
    [t]
  );

  if (isLoading) return <Loader />;
  if (error)
    return (
      <p className="text-destructive">
        {t('common.error')}: {error.message}
      </p>
    );

  const { verifications, pagination } = data || {};

  return (
    <div className="m-3 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-grow">
          <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={handleSearchChange}
            placeholder={t('verifications.search_placeholder')}
            value={searchTerm}
          />
        </div>
        <Select
          onChange={handleSortChange}
          options={sortOptions}
          value={`${sortBy}-${sortOrder}`}
        />
      </div>

      {verifications && verifications.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {verifications.map((v) => (
            <UserVerificationCard key={v.id} verification={v} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <p>{t('verifications.no_results')}</p>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-muted-foreground text-sm">
            {t('pagination.showing', {
              start: (pagination.currentPage - 1) * pagination.limit + 1,
              end: Math.min(pagination.currentPage * pagination.limit, pagination.totalCount),
              total: pagination.totalCount,
            })}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              {t('pagination.previous')}
            </Button>
            <Button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              {t('pagination.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
