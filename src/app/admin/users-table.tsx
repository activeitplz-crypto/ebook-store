
'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Profile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface EnrichedProfile extends Profile {
  totalReferrals: number;
  verifiedReferrals: number;
  unverifiedReferrals: number;
}

export function UsersTable() {
  const [users, setUsers] = useState<EnrichedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchAndProcessUsers = async () => {
      setLoading(true);
      
      // Fetch all profiles from the database
      const { data: profiles, error } = await supabase.from('profiles').select('*');
      
      if (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        setLoading(false);
        return;
      }

      if (!profiles) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Create a map for quick lookup of who referred whom
      const referralMap = new Map<string, string[]>();
      profiles.forEach(p => {
        if (p.referred_by) {
          if (!referralMap.has(p.referred_by)) {
            referralMap.set(p.referred_by, []);
          }
          referralMap.get(p.referred_by)!.push(p.id);
        }
      });
      
      // Create a map of profiles by their ID for quick lookup
      const profilesById = new Map<string, Profile>(profiles.map(p => [p.id, p]));

      // Enrich each profile with referral counts
      const enrichedProfiles: EnrichedProfile[] = profiles.map(user => {
        const referredUserIds = referralMap.get(user.id) || [];
        const totalReferrals = referredUserIds.length;
        
        let verifiedReferrals = 0;
        
        referredUserIds.forEach(referredId => {
          const referredUser = profilesById.get(referredId);
          if (referredUser && referredUser.current_plan) {
            verifiedReferrals++;
          }
        });

        const unverifiedReferrals = totalReferrals - verifiedReferrals;

        return {
          ...user,
          totalReferrals,
          verifiedReferrals,
          unverifiedReferrals
        };
      });

      setUsers(enrichedProfiles);
      setLoading(false);
    };

    fetchAndProcessUsers();

     const channel = supabase
      .channel('realtime-profiles-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchAndProcessUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [supabase]);

  if (loading) {
    return (
       <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Total Referrals</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Unverified</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
              <TableCell><Skeleton className="h-6 w-[100px] rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Total Referrals</TableHead>
          <TableHead>Verified</TableHead>
          <TableHead>Unverified</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length > 0 ? (
          users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name || 'N/A'}</TableCell>
              <TableCell>{u.email || 'N/A'}</TableCell>
              <TableCell><Badge variant="secondary">{u.current_plan || 'None'}</Badge></TableCell>
              <TableCell className="text-center">{u.totalReferrals}</TableCell>
              <TableCell className="text-center text-green-600 font-semibold">{u.verifiedReferrals}</TableCell>
              <TableCell className="text-center text-red-600 font-semibold">{u.unverifiedReferrals}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No users found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
