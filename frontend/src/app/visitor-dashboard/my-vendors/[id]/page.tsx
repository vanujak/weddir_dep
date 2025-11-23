'use client';

import Breadcrumbs from '@/components/Breadcrumbs';
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { FIND_ALL_MY_VENDORS } from '@/graphql/queries';
import { useAuth } from '@/contexts/VisitorAuthContext';
import CategoryDropdown from '@/components/visitor-dashboard/my-vendors/CategoryDropdown';
import categories from '@/utils/category.json';

interface MyVendor {
  id: string;
  offering: {
    id: string;
    name: string;
    category: string;
    banner: string;
    vendor: {
      busname: string;
      city: string;
    };
  };
}

const MyVendors = () => {
  const { visitor } = useAuth();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const { data, loading, error } = useQuery(
    FIND_ALL_MY_VENDORS,
    {
      variables: {
        visitorId: visitor?.id,
      },
      skip: !visitor?.id,
      fetchPolicy: 'cache-and-network', // Ensure we get fresh data
    }
  );

  // Get all vendors and ensure they have an offering
  const allVendors = useMemo(() => {
    return (data?.findAllMyVendors || []).filter((v: MyVendor) => v?.offering);
  }, [data]);

  const [showAdded, setShowAdded] = useState(false);

  const handleCategoryClick = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Extract unique categories from vendors
  const vendorCategories = useMemo(() => {
    return Array.from(new Set(
      allVendors
        .map((v: MyVendor) => v.offering?.category)
        .filter((c: string) => typeof c === 'string')
    ));
  }, [allVendors]);

  // Merge with static categories to ensure we show everything
  const allCategories = useMemo(() => {
    return Array.from(new Set([...categories, ...vendorCategories as string[]]));
  }, [vendorCategories]);

  // Filter categories that have vendors if showAdded is true
  const filteredCategories = useMemo(() => {
    return showAdded
      ? allCategories.filter((category) =>
        allVendors.some(
          (vendor: MyVendor) => vendor.offering?.category === category
        )
      )
      : allCategories;
  }, [showAdded, allCategories, allVendors]);

  return (
    <div className="py-4 px-2 md:py-6 md:px-4">
      {/* Hide breadcrumbs on mobile */}
      <div className="hidden md:block shadow-md bg-white p-4 rounded-lg mb-4 md:mb-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/visitor-dashboard" },
            { label: "Checklist", href: "/visitor-dashboard/my-vendors" },
          ]}
        />
        <div>
          <h1 className="text-4xl md:text-3xl font-bold text-black font-title my-3">
            My Vendors
          </h1>
          <p className="font-body text-xl text-black">Easily organize all your vendors in one place</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-6 md:mt-12">
        <div className="flex flex-col items-center mb-4 md:mb-6 bg-white p-3 md:p-4 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-3 md:gap-0">
            <h1 className="text-2xl md:text-3xl font-bold font-title">
              Vendors List
            </h1>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showAdded}
                onChange={() => setShowAdded(!showAdded)}
                className="hidden"
              />
              <span
                className={`relative inline-block w-12 h-6 transition duration-200 ease-linear rounded-full ${showAdded ? "bg-slate-600" : "bg-orange"
                  }`}
              >
                <span
                  className={`absolute left-0 inline-block w-6 h-6 transform transition duration-100 ease-linear bg-white rounded-full ${showAdded
                    ? "translate-x-full bg-slate-600"
                    : "translate-x-0 bg-orange"
                    }`}
                />
              </span>
              <span className="ml-3 text-sm font-body font-medium text-gray-900">
                {showAdded ? "Show All" : "Show Added"}
              </span>
            </label>
          </div>

          {/* Category Dropdowns */}
          <div className="w-full mt-6">
            {filteredCategories.map((category) => (
              <CategoryDropdown
                key={category}
                category={category}
                isExpanded={expandedCategories.has(category)}
                onToggle={handleCategoryClick}
                loading={loading}
                vendors={allVendors}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyVendors;