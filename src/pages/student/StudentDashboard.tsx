import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CalendarCheck, Plus, RefreshCw, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import BookingCard from "@/components/BookingCard";
import { useTranslation } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useBooking } from "@/context/BookingContext";
import { toast } from "sonner";
import { formatDate, formatTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 9; // Number of rooms to display per page

const StudentDashboard = () => {
  const { t } = useTranslation();
  const { bookings, rooms, isRefreshing, refreshBookings, refreshRooms } = useBooking();

  // Booking states
  const [activeBookings, setActiveBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);

  // Room states
  const [availableRooms, setAvailableRooms] = useState([]);
  const [filteredAllRooms, setFilteredAllRooms] = useState([]);
  const [filteredAvailableRooms, setFilteredAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("_none_");
  const [capacityFilter, setCapacityFilter] = useState([0, 100]);
  const [statusFilter, setStatusFilter] = useState("_none_");
  const [activeTab, setActiveTab] = useState("available");

  // Pagination states
  const [allRoomsPage, setAllRoomsPage] = useState(1);
  const [availableRoomsPage, setAvailableRoomsPage] = useState(1);
  const [allRoomsTotalPages, setAllRoomsTotalPages] = useState(1);
  const [availableRoomsTotalPages, setAvailableRoomsTotalPages] = useState(1);

  // Get unique room categories from available rooms - FILTER OUT EMPTY VALUES
  const roomCategories = rooms
      ? [...new Set(rooms.map(room => room.category))]
          .filter(category => category && category.trim() !== '') // Filter out empty or whitespace only values
          .sort()
      : [];

  // Max capacity for capacity filter
  const maxCapacity = rooms?.length
      ? Math.max(...rooms.map(room => room.capacity || 0))
      : 100;

  // Helper function to check if a room is currently available
  const isRoomAvailableNow = (room) => {
    if (room.status !== 'available') return false;

    const now = new Date();
    return !room.schedule?.some(slot => {
      const start = new Date(slot.start_time || slot.from_date);
      const end = new Date(slot.end_time || slot.until_date);
      return start <= now && end >= now;
    });
  };

  // Process bookings when they change
  useEffect(() => {
    if (bookings) {
      // Sort bookings into active, upcoming and past
      const now = new Date();

      const active = bookings.filter(booking => {
        const start = new Date(booking.start);
        const end = new Date(booking.end);
        return start <= now && end >= now && booking.status !== 'rejected';
      });

      const upcoming = bookings.filter(booking => {
        const start = new Date(booking.start);
        return start > now && booking.status !== 'rejected';
      });

      const past = bookings.filter(booking => {
        const end = new Date(booking.end);
        return end < now || booking.status === 'rejected' || booking.status === 'taken';
      });

      setActiveBookings(active);
      setUpcomingBookings(upcoming);
      setPastBookings(past);
      setIsLoading(false);
    }
  }, [bookings]);

  // Process rooms when they change
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      // Filter for available rooms right now
      const available = rooms.filter(isRoomAvailableNow);
      setAvailableRooms(available);

      // Initialize filtered rooms
      setFilteredAllRooms(rooms);
      setFilteredAvailableRooms(available);

      // Calculate total pages
      setAllRoomsTotalPages(Math.ceil(rooms.length / ITEMS_PER_PAGE));
      setAvailableRoomsTotalPages(Math.ceil(available.length / ITEMS_PER_PAGE));
    }
  }, [rooms]);

  // Apply search and filters whenever they change
  useEffect(() => {
    if (!rooms) return;

    const applyFilters = (roomsList) => {
      let filtered = [...roomsList];

      // Apply search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(room =>
            room.name.toLowerCase().includes(query) ||
            (room.category && room.category.toLowerCase().includes(query)) ||
            (room.building && room.building.toLowerCase().includes(query))
        );
      }

      // Apply category filter
      if (categoryFilter && categoryFilter !== "_none_") {
        filtered = filtered.filter(room => room.category === categoryFilter);
      }

      // Apply capacity filter
      filtered = filtered.filter(room => {
        const capacity = room.capacity || 0;
        return capacity >= capacityFilter[0] && capacity <= capacityFilter[1];
      });

      // Apply status filter
      if (statusFilter && statusFilter !== "_none_") {
        filtered = filtered.filter(room => room.status === statusFilter);
      }

      return filtered;
    };

    // Apply filters to all rooms
    const filteredAll = applyFilters(rooms);
    setFilteredAllRooms(filteredAll);
    setAllRoomsTotalPages(Math.ceil(filteredAll.length / ITEMS_PER_PAGE));
    setAllRoomsPage(1);

    // Apply filters to available rooms
    const filteredAvailable = applyFilters(availableRooms);
    setFilteredAvailableRooms(filteredAvailable);
    setAvailableRoomsTotalPages(Math.ceil(filteredAvailable.length / ITEMS_PER_PAGE));
    setAvailableRoomsPage(1);

  }, [rooms, availableRooms, searchQuery, categoryFilter, capacityFilter, statusFilter]);

  // Get current page of rooms
  const getCurrentPageRooms = (roomsList, page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return roomsList.slice(startIndex, endIndex);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("_none_");
    setCapacityFilter([0, maxCapacity]);
    setStatusFilter("_none_");
  };

  // Pagination handlers for All Rooms
  const nextAllRoomsPage = () => {
    if (allRoomsPage < allRoomsTotalPages) {
      setAllRoomsPage(prev => prev + 1);
    }
  };

  const prevAllRoomsPage = () => {
    if (allRoomsPage > 1) {
      setAllRoomsPage(prev => prev - 1);
    }
  };

  // Pagination handlers for Available Rooms
  const nextAvailableRoomsPage = () => {
    if (availableRoomsPage < availableRoomsTotalPages) {
      setAvailableRoomsPage(prev => prev + 1);
    }
  };

  const prevAvailableRoomsPage = () => {
    if (availableRoomsPage > 1) {
      setAvailableRoomsPage(prev => prev - 1);
    }
  };

  // Helper function to format capacity display
  const formatCapacity = (capacity) => {
    if (!capacity) return '';
    return `${t('rooms.capacity')}: ${capacity}`;
  };

  // Refresh data
  const handleRefresh = async () => {
    try {
      await refreshBookings();
      await refreshRooms();
      toast.success(t('dashboard.dataRefreshed'));
    } catch (error) {
      toast.error(t('dashboard.refreshError'));
      console.error("Error refreshing data:", error);
    }
  };

  // Render pagination UI
  const renderPagination = (currentPage, totalPages, prevPage, nextPage, itemsCount) => {
    return (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            {t('dashboard.showing')} {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, itemsCount)} {t('dashboard.of')} {itemsCount} {t('dashboard.results')}
          </p>

          <div className="flex items-center gap-1">
            <Button
                variant="outline"
                size="icon"
                onClick={prevPage}
                disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </Button>

            <span className="text-sm mx-2">
            {t('dashboard.page')} {currentPage} {t('dashboard.of')} {totalPages}
          </span>

            <Button
                variant="outline"
                size="icon"
                onClick={nextPage}
                disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
    );
  };

  // Helper function to render booking lists
  const renderBookingList = (bookings, emptyMessage) => {
    if (isLoading || isRefreshing) {
      return (
          <div className="py-4 text-center">
            <p className="text-muted-foreground">{t('common.loading')}...</p>
          </div>
      );
    }

    if (!bookings || bookings.length === 0) {
      return (
          <p className="text-muted-foreground text-sm py-4 text-center">
            {emptyMessage}
          </p>
      );
    }

    return bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
    ));
  };

  // Render a room card
  const renderRoomCard = (room) => (
      <Card key={room.id} className="card-hover">
        <CardContent className="p-0">
          <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
            {room.image_url ? (
                <img
                    src={room.image_url}
                    alt={room.name}
                    className="object-cover w-full h-full"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                  <Calendar className="text-primary h-12 w-12 opacity-50" />
                </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium">{room.name}</h3>
            <p className="text-sm text-muted-foreground">
              {room.category || room.building}
            </p>
            <div className="mt-2 flex items-center text-sm justify-between">
              <div>
              <span className={`${room.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'} px-2 py-0.5 rounded-full text-xs font-medium`}>
                {room.status === 'available' ? t('dashboard.available') : t('dashboard.maintenance')}
              </span>
                {room.capacity && (
                    <span className="ml-2 text-muted-foreground">
                  {formatCapacity(room.capacity)}
                </span>
                )}
              </div>

              {room.status === 'available' && (
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/student/booking?roomId=${room.id}`}>{t('dashboard.book')}</Link>
                  </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
  );

  return (
      <PageLayout role="student">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
              <p className="text-muted-foreground">
                {t('dashboard.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  title={t('dashboard.refreshData')}
              >
                <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
              </Button>
              <LanguageSwitcher />
              <Button asChild className="self-start">
                <Link to="/student/booking" className="flex items-center gap-2">
                  <Plus size={18} />
                  {t('dashboard.bookRoom')}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="text-primary" size={20} />
                  {t('dashboard.currentBookings')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.currentBookingsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderBookingList(activeBookings, t('dashboard.noActiveBookings'))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="text-primary" size={20} />
                  {t('dashboard.upcomingBookings')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.upcomingBookingsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderBookingList(upcomingBookings, t('dashboard.noUpcomingBookings'))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarCheck className="text-primary" size={20} />
                  {t('dashboard.bookingHistory')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.bookingHistoryDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderBookingList(pastBookings, t('dashboard.noPastBookings'))}
              </CardContent>
            </Card>
          </div>

          {/* Rooms Section */}
          <Tabs
              defaultValue="available"
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <TabsList>
                <TabsTrigger value="available">{t('dashboard.availableNow')}</TabsTrigger>
                <TabsTrigger value="all">{t('dashboard.allRooms')}</TabsTrigger>
              </TabsList>

              {/* Search and filter controls - now available for both tabs */}
              <div className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Input
                      placeholder={t('dashboard.searchRooms')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                      icon={<Search size={16} />}
                  />
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex gap-2">
                      <Filter size={16} />
                      {t('dashboard.filters')}
                      {(categoryFilter !== "_none_" || statusFilter !== "_none_" || capacityFilter[0] > 0 || capacityFilter[1] < maxCapacity) && (
                          <Badge variant="secondary" className="ml-1 px-1 py-0 h-5 min-w-5 rounded-full">
                            {[
                              categoryFilter !== "_none_" && 1,
                              statusFilter !== "_none_" && 1,
                              (capacityFilter[0] > 0 || capacityFilter[1] < maxCapacity) && 1
                            ].filter(Boolean).length}
                          </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">{t('dashboard.filterRooms')}</h4>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('dashboard.category')}</label>
                        <Select
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('dashboard.anyCategory')} />
                          </SelectTrigger>
                          <SelectContent>
                            {/* The value prop MUST NOT be an empty string */}
                            <SelectItem value="_none_">{t('dashboard.anyCategory')}</SelectItem>
                            {roomCategories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('dashboard.status')}</label>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('dashboard.anyStatus')} />
                          </SelectTrigger>
                          <SelectContent>
                            {/* The value prop MUST NOT be an empty string */}
                            <SelectItem value="_none_">{t('dashboard.anyStatus')}</SelectItem>
                            <SelectItem value="available">{t('dashboard.available')}</SelectItem>
                            <SelectItem value="maintenance">{t('dashboard.maintenance')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium">{t('dashboard.capacity')}</label>
                          <span className="text-sm text-muted-foreground">
                            {capacityFilter[0]} - {capacityFilter[1] === maxCapacity ? capacityFilter[1]+ '+' : capacityFilter[1]}
                          </span>
                        </div>
                        <Slider
                            value={capacityFilter}
                            min={0}
                            max={maxCapacity}
                            step={5}
                            onValueChange={setCapacityFilter}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                        >
                          {t('dashboard.resetFilters')}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <TabsContent value="available">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? (
                      <p className="col-span-3 text-center py-8 text-muted-foreground">{t('common.loading')}...</p>
                  ) : getCurrentPageRooms(filteredAvailableRooms, availableRoomsPage).length > 0 ? (
                      getCurrentPageRooms(filteredAvailableRooms, availableRoomsPage).map(renderRoomCard)
                  ) : (
                      <p className="col-span-3 text-center py-8 text-muted-foreground">
                        {searchQuery || categoryFilter !== "_none_" || statusFilter !== "_none_" || capacityFilter[0] > 0 || capacityFilter[1] < maxCapacity
                            ? t('dashboard.noRoomsMatchFilters')
                            : t('dashboard.noRoomsAvailableNow')}
                      </p>
                  )}
                </div>

                {/* Pagination for Available Rooms */}
                {filteredAvailableRooms.length > 0 &&
                    renderPagination(
                        availableRoomsPage,
                        availableRoomsTotalPages,
                        prevAvailableRoomsPage,
                        nextAvailableRoomsPage,
                        filteredAvailableRooms.length
                    )
                }
              </div>
            </TabsContent>

            <TabsContent value="all">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? (
                      <p className="col-span-3 text-center py-8 text-muted-foreground">{t('common.loading')}...</p>
                  ) : getCurrentPageRooms(filteredAllRooms, allRoomsPage).length > 0 ? (
                      getCurrentPageRooms(filteredAllRooms, allRoomsPage).map(renderRoomCard)
                  ) : (
                      <p className="col-span-3 text-center py-8 text-muted-foreground">
                        {searchQuery || categoryFilter !== "_none_" || statusFilter !== "_none_" || capacityFilter[0] > 0 || capacityFilter[1] < maxCapacity
                            ? t('dashboard.noRoomsMatchFilters')
                            : t('dashboard.noRoomsAvailable')}
                      </p>
                  )}
                </div>

                {/* Pagination for All Rooms */}
                {filteredAllRooms.length > 0 &&
                    renderPagination(
                        allRoomsPage,
                        allRoomsTotalPages,
                        prevAllRoomsPage,
                        nextAllRoomsPage,
                        filteredAllRooms.length
                    )
                }
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
  );
};

export default StudentDashboard;