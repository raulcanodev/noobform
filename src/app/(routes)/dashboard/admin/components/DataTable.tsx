'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Input,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { deleteUser, searchUsers } from '@/lib/actions/users';
import { useDebounce } from '@/hooks/use-debounce';
import { UserTableProps, IUser } from '@/types/user';
import { Combobox } from './Combobox';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const defaultColumns = {
  name: { title: 'Name', default: true, type: 'string' as const },
  email: { title: 'Email', default: true, type: 'string' as const },
  role: { title: 'Role', default: false, type: 'string' as const },
  banned: { title: 'Banned', default: false, type: 'boolean' as const },
  createdAt: { title: 'Created At', default: true, type: 'date' as const },
  subscriptionPlan: { title: 'Subscription Plan', default: true, type: 'string' as const },
  customerId: { title: 'Customer Id', default: false, type: 'string' as const },
  subscriptionId: { title: 'Subscription Id', default: false, type: 'string' as const },
  billingInterval: { title: 'Billing Interval', default: false, type: 'string' as const },
  status: { title: 'Status', default: false, type: 'string' as const },
  billingStart: { title: 'Billing Start', default: false, type: 'date' as const },
  billingEnd: { title: 'Billing End', default: false, type: 'date' as const },
  planCanceled: { title: 'Plan Canceled', default: false, type: 'boolean' as const },
};

type ColumnId = keyof typeof defaultColumns;

export function UserTable({ initialUsers, totalUsers }: UserTableProps) {
  const [users, setUsers] = useState<IUser[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    field: keyof IUser;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<ColumnId[]>(
    Object.entries(defaultColumns)
      .filter(([, config]) => config.default)
      .map(([key]) => key as ColumnId)
  );
  const [isClient, setIsClient] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const router = useRouter();

  const pageSize = totalRows;
  const totalPages = Math.ceil(totalUsers / pageSize);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    const results = await searchUsers(debouncedSearchTerm, currentPage, pageSize);
    setUsers(results);
    setIsLoading(false);
  }, [debouncedSearchTerm, currentPage, pageSize]);

  const handleDelete = async (userId: string, userEmail: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const emailConfirmation = prompt(
        `Please type the user email '${userEmail}' to delete the user:`
      );

      if (emailConfirmation === userEmail) {
        try {
          await deleteUser(userId);
          setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
          router.refresh();
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('Failed to delete user. Please try again.');
        }
      } else {
        alert('Email does not match. Deletion canceled.');
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    handleSearch();
  };

  const onSort = (field: keyof IUser, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction });
    const sortedUsers = [...users].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (aValue === null || aValue === undefined) return direction === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return direction === 'asc' ? -1 : 1;

      const columnType = defaultColumns[field as ColumnId].type;

      switch (columnType) {
        case 'boolean':
          return direction === 'asc'
            ? aValue === bValue
              ? 0
              : aValue
              ? -1
              : 1
            : aValue === bValue
            ? 0
            : aValue
            ? 1
            : -1;
        case 'date':
          return direction === 'asc'
            ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime()
            : new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
        default:
          const aString = String(aValue).toLowerCase();
          const bString = String(bValue).toLowerCase();
          return direction === 'asc'
            ? aString.localeCompare(bString)
            : bString.localeCompare(aString);
      }
    });
    setUsers(sortedUsers);
  };

  const toggleColumn = (columnId: ColumnId) => {
    setVisibleColumns((current) =>
      current.includes(columnId) ? current.filter((id) => id !== columnId) : [...current, columnId]
    );
  };

  useEffect(() => {
    if (isClient) {
      handleSearch();
    }
  }, [handleSearch, isClient]);

  const formatCellValue = (
    value: IUser[keyof IUser],
    type: (typeof defaultColumns)[ColumnId]['type']
  ): string => {
    if (value === null || value === undefined) return 'N/A';
    switch (type) {
      case 'boolean':
        return (value as boolean) ? 'Yes' : 'No';
      case 'date':
        return new Date(value as string).toLocaleString();
      default:
        return String(value);
    }
  };

  if (!isClient) {
    return null; // or a loading indicator
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Toggle columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {(
              Object.entries(defaultColumns) as [ColumnId, (typeof defaultColumns)[ColumnId]][]
            ).map(([key, config]) => (
              <DropdownMenuCheckboxItem
                key={key}
                className="capitalize"
                checked={visibleColumns.includes(key)}
                onCheckedChange={() => toggleColumn(key)}
              >
                {config.title}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map((columnId) => (
              <TableHead key={columnId}>
                <Combobox
                  title={defaultColumns[columnId].title}
                  field={columnId}
                  sortDirection={sortConfig?.field === columnId ? sortConfig.direction : null}
                  onSort={onSort}
                  onHide={() => toggleColumn(columnId)}
                />
              </TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + 1} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user._id}>
                {visibleColumns.map((columnId) => (
                  <TableCell key={columnId}>
                    {formatCellValue(user[columnId as keyof IUser], defaultColumns[columnId].type)}
                  </TableCell>
                ))}
                <TableCell>
                  <Button variant="outline" onClick={() => handleDelete(user._id, user.email)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <Select onValueChange={(value) => setTotalRows(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rows per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value='10'>10 Rows</SelectItem>
              <SelectItem value='25'>25 Rows</SelectItem>
              <SelectItem value='50'>50 Rows</SelectItem>
              <SelectItem value='100'>100 Rows</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <div className="space-x-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
          >
            <ChevronLeft />
          </Button>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
