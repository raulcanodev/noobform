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
} from '@/components/ui';
import { deleteUser, searchUsers } from '@/lib/actions/users';
import { useDebounce } from '@/hooks/use-debounce';
import config from '@/config';
import { UserTableProps, IUser } from '@/types/user';
import { Combobox } from './Combobox';

export function UserTable({ initialUsers, totalUsers }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ field: keyof IUser; direction: 'asc' | 'desc' } | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const pageSize = config.admin.page.usersPerPage;
  const totalPages = Math.ceil(totalUsers / pageSize);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    const results = await searchUsers(debouncedSearchTerm, currentPage, pageSize);
    setUsers(results);
    setIsLoading(false);
  }, [debouncedSearchTerm, currentPage, pageSize]);

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(userId);
      handleSearch(); // Refresh the current page
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    handleSearch();
  };

  const onSort = (field: keyof IUser, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction });
    const sortedUsers = [...users].sort((a, b) => {
      // @ts-expect-error - TS doesn't like dynamic field access
      if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
      // @ts-expect-error - TS doesn't like dynamic field access
      if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setUsers(sortedUsers);
  };

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return (
    <div>
      <Input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Combobox 
                title="Name" 
                field="name" 
                sortDirection={sortConfig?.field === 'name' ? sortConfig.direction : null} 
                onSort={onSort} 
                onHide={() => {}} 
              />
            </TableHead>
            <TableHead>
              <Combobox 
                title="Email" 
                field="email" 
                sortDirection={sortConfig?.field === 'email' ? sortConfig.direction : null} 
                onSort={onSort} 
                onHide={() => {}} 
              />
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Button variant="outline" onClick={() => handleDelete(user._id!)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
        >
          Previous
        </Button>
        <span className='text-sm'>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
}