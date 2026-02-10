import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Briefcase, FileText, CheckSquare, Package, Wrench, Box, Users } from 'lucide-react';
import { globalSearch } from '../db/database';
import debounce from 'lodash/debounce';

const categoryIcons = {
  jobs: Briefcase,
  logs: FileText,
  tasks: CheckSquare,
  orders: Package,
  tools: Wrench,
  inventory: Box,
  crew: Users
};

const categoryColors = {
  jobs: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  logs: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  tasks: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  orders: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  tools: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  inventory: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  crew: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
};

export default function GlobalSearch({ open, onClose, onResultClick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const performSearch = useCallback(
    debounce(async (searchTerm) => {
      if (searchTerm.length < 2) {
        setResults(null);
        return;
      }
      setLoading(true);
      const searchResults = await globalSearch(searchTerm);
      setResults(searchResults);
      setLoading(false);
    }, 300),
    []
  );

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  const handleResultClick = (category, item) => {
    onResultClick(category, item);
    onClose();
    setQuery('');
    setResults(null);
  };

  const getTotalResults = () => {
    if (!results) return 0;
    return Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
  };

  const getItemTitle = (category, item) => {
    switch (category) {
      case 'jobs': return item.name;
      case 'logs': return `Log: ${item.date}`;
      case 'tasks': return item.title;
      case 'orders': return item.item;
      case 'tools': return item.name;
      case 'inventory': return item.name;
      case 'crew': return item.name;
      default: return 'Unknown';
    }
  };

  const getItemSubtitle = (category, item) => {
    switch (category) {
      case 'jobs': return item.address;
      case 'logs': return item.notes?.substring(0, 50);
      case 'tasks': return item.description?.substring(0, 50);
      case 'orders': return `Qty: ${item.quantity} - ${item.status}`;
      case 'tools': return `${item.category} - ${item.condition}`;
      case 'inventory': return `Qty: ${item.quantity}`;
      case 'crew': return item.role;
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Search Everything</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, tasks, logs, orders, tools..."
              className="pl-10 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          </div>

          {loading && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              Searching...
            </div>
          )}

          {results && !loading && (
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {getTotalResults()} results found
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {Object.entries(results).map(([category, items]) => {
                    if (items.length === 0) return null;
                    const Icon = categoryIcons[category];
                    
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="font-medium capitalize dark:text-white">{category}</span>
                          <Badge variant="secondary">{items.length}</Badge>
                        </div>
                        <div className="space-y-1">
                          {items.map((item) => (
                            <div
                              key={item._id}
                              className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors"
                              onClick={() => handleResultClick(category, item)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate dark:text-white">
                                    {getItemTitle(category, item)}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {getItemSubtitle(category, item)}
                                  </p>
                                </div>
                                <Badge className={categoryColors[category]}>
                                  {category}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {query.length > 0 && query.length < 2 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              Type at least 2 characters to search
            </div>
          )}

          {results && getTotalResults() === 0 && !loading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No results found for "{query}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}