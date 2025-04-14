import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Search, Building, Pencil, Trash, LayoutGrid } from "lucide-react";
import { useBooking, RoomType, RoomStatus, Room } from "@/context/BookingContext";
import { toast } from "sonner";
import { useTranslation } from "@/context/LanguageContext";
import { roomsApi } from "@/services/api";

const RoomsPage = () => {
  const { t } = useTranslation();
  const { rooms = [], deleteRoom, isLoading, fetchRooms } = useBooking();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [updatingRoom, setUpdatingRoom] = useState(false);
  const [addingRoom, setAddingRoom] = useState(false);

  // Filter for room type
  const [selectedType, setSelectedType] = useState<string>("all");
  // Filter for building
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  // Filter for status
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Room state
  const [newRoom, setNewRoom] = useState<Room>({
    id: "",
    name: "",
    building: "",
    capacity: 0,
    type: "lecture",
    features: [],
    status: "available",
    floor: 1,
    description: ""
  });

  // Edited room state
  const [editedRoom, setEditedRoom] = useState<Room | null>(null);

  // Room types with translations
  const roomTypes = [
    { value: "lecture", label: t('rooms.types.lecture') },
    { value: "computer_lab", label: t('rooms.types.computerLab') },
    { value: "lab", label: t('rooms.types.lab') },
    { value: "conference", label: t('rooms.types.conference') },
    { value: "sports", label: t('rooms.types.sports') },
    { value: "office", label: t('rooms.types.office') },
    { value: "library", label: t('rooms.types.library') },
    { value: "coworking", label: t('rooms.types.coworking') }
  ];

  // Features with translations
  const availableFeatures = [
    { id: "projector", label: t('rooms.features.projector') },
    { id: "computer", label: t('rooms.features.computer') },
    { id: "whiteboard", label: t('rooms.features.whiteboard') },
    { id: "air_conditioning", label: t('rooms.features.airConditioning') },
    { id: "audio_system", label: t('rooms.features.audioSystem') },
    { id: "video_conferencing", label: t('rooms.features.videoConferencing') },
    { id: "specialized_equipment", label: t('rooms.features.specializedEquipment') },
    { id: "ventilation", label: t('rooms.features.ventilation') },
    { id: "safety_equipment", label: t('rooms.features.safetyEquipment') },
    { id: "computers", label: t('rooms.features.computers') },
    { id: "basketball_court", label: t('rooms.features.basketballCourt') },
    { id: "volleyball_court", label: t('rooms.features.volleyballCourt') },
    { id: "changing_rooms", label: t('rooms.features.changingRooms') },
    { id: "high_speed_internet", label: t('rooms.features.highSpeedInternet') },
    { id: "coffee_machine", label: t('rooms.features.coffeeMachine') },
    { id: "lounge_area", label: t('rooms.features.loungeArea') },
    { id: "meeting_table", label: t('rooms.features.meetingTable') },
    { id: "printer", label: t('rooms.features.printer') },
    { id: "quiet_zone", label: t('rooms.features.quietZone') },
    { id: "bookshelves", label: t('rooms.features.bookshelves') }
  ];

  // Get unique buildings
  const uniqueBuildings = Array.from(new Set((rooms || []).map(room => room.building).filter(Boolean)));

  // Filter rooms
  const filteredRooms = (rooms || []).filter(room => {
    const matchesSearch =
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof room.id === 'string' ? room.id.toLowerCase().includes(searchTerm.toLowerCase()) : String(room.id).includes(searchTerm.toLowerCase())) ||
        (room.building?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || room.type === selectedType;
    const matchesBuilding = selectedBuilding === "all" || room.building === selectedBuilding;
    const matchesStatus = selectedStatus === "all" || room.status === selectedStatus;

    return matchesSearch && matchesType && matchesBuilding && matchesStatus;
  });

  // Get room type label
  const getRoomTypeLabel = (type: RoomType): string => {
    const typeItem = roomTypes.find(item => item.value === type);
    return typeItem?.label || type;
  };

  // Get room status label
  const getRoomStatusLabel = (status: RoomStatus): string => {
    return t(`rooms.status.${status}`);
  };

  // Get status color class
  const getStatusColorClass = (status: RoomStatus): string => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "unavailable": return "bg-red-100 text-red-800";
      case "maintenance": return "bg-amber-100 text-amber-800";
      default: return "";
    }
  };

  // Fixed addRoomData function - now properly defined
  const addRoomData = async (roomData: Room): Promise<boolean> => {
    setAddingRoom(true);
    try {
      // Format the data to match what the backend expects
      const requestData = {
        name: roomData.name,
        category: roomData.type, // Map type to category for the API
        capacity: roomData.capacity,
        status: roomData.status || 'available'
      };

      // Call the API to create the room
      const response = await roomsApi.createRoom(requestData);

      if (response.success) {
        // Refresh the rooms list if available
        if (fetchRooms) {
          await fetchRooms();
        }
        toast.success(t('rooms.addSuccess'));
        return true;
      } else {
        toast.error(response.error || t('rooms.addError'));
        return false;
      }
    } catch (error) {
      console.error("Error adding room:", error);
      toast.error(t('rooms.addError'));
      return false;
    } finally {
      setAddingRoom(false);
    }
  };

  // Handle adding a new room
  // Updated handleAddRoom function
  const handleAddRoom = async () => {
    if (!newRoom.name) {
      toast.error(t('rooms.fillRequiredFields'));
      return;
    }

    const success = await addRoomData(newRoom);
    if (success) {
      setIsAddRoomOpen(false);
      // Reset form
      setNewRoom({
        id: "",
        name: "",
        building: "",
        capacity: 0,
        type: "lecture",
        features: [],
        status: "available",
        floor: 1,
        description: ""
      });
    }
  };

  // Toggle feature
  const toggleFeature = (feature: string, isEdit: boolean = false) => {
    if (isEdit && editedRoom) {
      // Ensure features exists and is an array
      const currentFeatures = editedRoom.features || [];

      if (currentFeatures.includes(feature)) {
        setEditedRoom({
          ...editedRoom,
          features: currentFeatures.filter(f => f !== feature)
        });
      } else {
        setEditedRoom({
          ...editedRoom,
          features: [...currentFeatures, feature]
        });
      }
    } else {
      // For newRoom
      if (newRoom.features.includes(feature)) {
        setNewRoom({
          ...newRoom,
          features: newRoom.features.filter(f => f !== feature)
        });
      } else {
        setNewRoom({
          ...newRoom,
          features: [...newRoom.features, feature]
        });
      }
    }
  };

  // Handle edit click
  const handleEditClick = (roomId: string) => {
    const roomToEdit = rooms.find(r => r.id === roomId);
    if (roomToEdit) {
      // Make sure features is always an array
      setEditedRoom({
        ...roomToEdit,
        features: roomToEdit.features || []
      });
      setActiveRoom(roomId);
    }
  };

  // Update room function since the context function is not available
  const updateRoomData = async (roomId: string, roomData: Room): Promise<boolean> => {
    setUpdatingRoom(true);
    try {
      // Format the data to match what the backend expects
      const requestData = {
        name: roomData.name,
        category: roomData.type, // Map 'type' to 'category' as expected by backend
        capacity: roomData.capacity,
        status: roomData.status
      };

      const response = await roomsApi.updateRoom(roomId, requestData);

      if (response.success) {
        // Update local state
        if (fetchRooms) {
          await fetchRooms();
        }
        toast.success(t('rooms.updateSuccess'));
        return true;
      } else {
        toast.error(response.error || t('rooms.updateError'));
        return false;
      }
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error(t('rooms.updateError'));
      return false;
    } finally {
      setUpdatingRoom(false);
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!editedRoom) return;

    const success = await updateRoomData(editedRoom.id, editedRoom);
    if (success) {
      setActiveRoom(null);
      setEditedRoom(null);
    }
  };

  // Handle delete click
  const handleDeleteClick = (roomId: string) => {
    setRoomToDelete(roomId);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;

    const success = await deleteRoom(roomToDelete);
    if (success) {
      setIsDeleteDialogOpen(false);
      setRoomToDelete(null);
    }
  };

  return (
      <PageLayout role="admin">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('rooms.title')}</h1>
              <p className="text-muted-foreground">
                {t('rooms.subtitle')}
              </p>
            </div>

            <Button onClick={() => setIsAddRoomOpen(true)} className="self-start md:self-auto">
              <PlusCircle className="h-4 w-4 mr-2" />
              {t('rooms.addRoom')}
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-72">
              <Card>
                <CardHeader>
                  <CardTitle>{t('rooms.filters.title')}</CardTitle>
                  <CardDescription>{t('rooms.filters.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">{t('rooms.filters.search')}</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                          id="search"
                          placeholder={t('rooms.filters.searchPlaceholder')}
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="building-filter">{t('rooms.filters.building')}</Label>
                    <Select
                        value={selectedBuilding}
                        onValueChange={setSelectedBuilding}
                    >
                      <SelectTrigger id="building-filter">
                        <SelectValue placeholder={t('rooms.filters.selectBuilding')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('rooms.filters.allBuildings')}</SelectItem>
                        {uniqueBuildings.map((building, index) => (
                            <SelectItem key={index} value={building}>{building}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type-filter">{t('rooms.filters.roomType')}</Label>
                    <Select
                        value={selectedType}
                        onValueChange={setSelectedType}
                    >
                      <SelectTrigger id="type-filter">
                        <SelectValue placeholder={t('rooms.filters.selectType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('rooms.filters.allTypes')}</SelectItem>
                        {roomTypes.map((type, index) => (
                            <SelectItem key={index} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status-filter">{t('rooms.filters.status')}</Label>
                    <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger id="status-filter">
                        <SelectValue placeholder={t('rooms.filters.selectStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('rooms.filters.allStatuses')}</SelectItem>
                        <SelectItem value="available">{t('rooms.status.available')}</SelectItem>
                        <SelectItem value="unavailable">{t('rooms.status.unavailable')}</SelectItem>
                        <SelectItem value="maintenance">{t('rooms.status.maintenance')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>{t('rooms.listTitle')}</CardTitle>
                  <CardDescription>
                    {t('rooms.totalRooms')}: {filteredRooms.length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="table">
                    <div className="flex justify-between items-center mb-4">
                      <TabsList>
                        <TabsTrigger value="table">{t('rooms.views.table')}</TabsTrigger>
                        <TabsTrigger value="grid">{t('rooms.views.grid')}</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="table">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>{t('rooms.fields.name')}</TableHead>
                              <TableHead>{t('rooms.fields.building')}</TableHead>
                              <TableHead>{t('rooms.fields.capacity')}</TableHead>
                              <TableHead>{t('rooms.fields.type')}</TableHead>
                              <TableHead>{t('rooms.fields.status')}</TableHead>
                              <TableHead>{t('rooms.fields.actions')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredRooms.length > 0 ? (
                                filteredRooms.map((room) => (
                                    <TableRow key={room.id}>
                                      <TableCell className="font-medium">{room.id}</TableCell>
                                      <TableCell>{room.name}</TableCell>
                                      <TableCell>{room.building}</TableCell>
                                      <TableCell>{room.capacity}</TableCell>
                                      <TableCell>{getRoomTypeLabel(room.type)}</TableCell>
                                      <TableCell>
                                        <Badge
                                            className={getStatusColorClass(room.status)}
                                        >
                                          {getRoomStatusLabel(room.status)}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex space-x-2">
                                          <Button variant="outline" size="icon" onClick={() => handleEditClick(room.id)}>
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button variant="outline" size="icon" className="text-red-500" onClick={() => handleDeleteClick(room.id)}>
                                            <Trash className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                  <TableCell colSpan={8} className="text-center">
                                    {t('rooms.noRoomsFound')}
                                  </TableCell>
                                </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    <TabsContent value="grid">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRooms.length > 0 ? (
                            filteredRooms.map((room) => (
                                <Card key={room.id} className="overflow-hidden">
                                  <div className="h-32 bg-primary/10 flex items-center justify-center">
                                    <Building className="h-16 w-16 text-primary/40" />
                                  </div>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-medium text-lg">{room.name}</h3>
                                        <p className="text-sm text-muted-foreground">{room.building}</p>
                                      </div>
                                      <Badge
                                          className={getStatusColorClass(room.status)}
                                      >
                                        {getRoomStatusLabel(room.status)}
                                      </Badge>
                                    </div>
                                    <div className="mt-2 space-y-1">
                                      <p className="text-sm">ID: <span className="font-medium">{room.id}</span></p>
                                      <p className="text-sm">{t('rooms.fields.capacity')}: <span className="font-medium">{room.capacity}</span></p>
                                      <p className="text-sm">{t('rooms.fields.type')}: <span className="font-medium">{getRoomTypeLabel(room.type)}</span></p>
                                      {room.description && (
                                          <p className="text-sm mt-2">{room.description}</p>
                                      )}
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-1">
                                      {(room.features || []).map((feature, index) => {
                                        const featureObj = availableFeatures.find(f => f.id === feature);
                                        return (
                                            <Badge key={index} variant="outline" className="text-xs">
                                              {featureObj?.label || feature}
                                            </Badge>
                                        );
                                      })}
                                    </div>
                                    <div className="mt-4 flex justify-end space-x-2">
                                      <Button variant="outline" size="sm" onClick={() => handleEditClick(room.id)}>
                                        <Pencil className="h-3 w-3 mr-1" />
                                        {t('rooms.actions.edit')}
                                      </Button>
                                      <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDeleteClick(room.id)}>
                                        <Trash className="h-3 w-3 mr-1" />
                                        {t('rooms.actions.delete')}
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                              {t('rooms.noRoomsFound')}
                            </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Add Room Dialog */}
        <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t('rooms.dialogs.addRoom.title')}</DialogTitle>
              <DialogDescription>
                {t('rooms.dialogs.addRoom.description')}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room-name">{t('rooms.fields.name')} *</Label>
                  <Input
                      id="room-name"
                      placeholder={t('rooms.placeholders.name')}
                      value={newRoom.name}
                      onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-capacity">{t('rooms.fields.capacity')} *</Label>
                  <Input
                      id="room-capacity"
                      type="number"
                      min="1"
                      placeholder={t('rooms.placeholders.capacity')}
                      value={newRoom.capacity || ''}
                      onChange={(e) => setNewRoom({...newRoom, capacity: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room-type">{t('rooms.fields.type')} *</Label>
                  <Select
                      value={newRoom.type}
                      onValueChange={(value: any) => setNewRoom({...newRoom, type: value})}
                  >
                    <SelectTrigger id="room-type">
                      <SelectValue placeholder={t('rooms.placeholders.selectType')} />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((type, index) => (
                          <SelectItem key={index} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-status">{t('rooms.fields.status')} *</Label>
                  <Select
                      value={newRoom.status}
                      onValueChange={(value: any) => setNewRoom({...newRoom, status: value})}
                  >
                    <SelectTrigger id="room-status">
                      <SelectValue placeholder={t('rooms.placeholders.selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">{t('rooms.status.available')}</SelectItem>
                      <SelectItem value="unavailable">{t('rooms.status.unavailable')}</SelectItem>
                      <SelectItem value="maintenance">{t('rooms.status.maintenance')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddRoomOpen(false)} disabled={addingRoom}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleAddRoom} disabled={addingRoom}>
                {addingRoom ? t('rooms.actions.adding') : t('rooms.actions.add')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Room Dialog */}
        <Dialog open={!!activeRoom} onOpenChange={(open) => !open && setActiveRoom(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t('rooms.dialogs.editRoom.title')}</DialogTitle>
              <DialogDescription>
                {t('rooms.dialogs.editRoom.description')}
              </DialogDescription>
            </DialogHeader>

            {editedRoom && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-room-id">{t('rooms.fields.id')}</Label>
                      <Input
                          id="edit-room-id"
                          value={editedRoom.id}
                          disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-room-name">{t('rooms.fields.name')}</Label>
                      <Input
                          id="edit-room-name"
                          value={editedRoom.name}
                          onChange={(e) => setEditedRoom({...editedRoom, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-room-building">{t('rooms.fields.building')}</Label>
                      <Select
                          value={editedRoom.building}
                          onValueChange={(value) => setEditedRoom({...editedRoom, building: value})}
                      >
                        <SelectTrigger id="edit-room-building">
                          <SelectValue placeholder={t('rooms.placeholders.selectBuilding')} />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueBuildings.map((building, index) => (
                              <SelectItem key={index} value={building}>{building}</SelectItem>
                          ))}
                          <SelectItem value="Главный корпус">{t('rooms.buildings.main')}</SelectItem>
                          <SelectItem value="Технический корпус">{t('rooms.buildings.technical')}</SelectItem>
                          <SelectItem value="Административный корпус">{t('rooms.buildings.administrative')}</SelectItem>
                          <SelectItem value="Научный корпус">{t('rooms.buildings.scientific')}</SelectItem>
                          <SelectItem value="Спортивный комплекс">{t('rooms.buildings.sports')}</SelectItem>
                          <SelectItem value="Библиотека">{t('rooms.buildings.library')}</SelectItem>
                          <SelectItem value="Студенческий центр">{t('rooms.buildings.studentCenter')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-room-capacity">{t('rooms.fields.capacity')}</Label>
                      <Input
                          id="edit-room-capacity"
                          type="number"
                          min="1"
                          value={editedRoom.capacity || ''}
                          onChange={(e) => setEditedRoom({...editedRoom, capacity: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-room-type">{t('rooms.fields.type')}</Label>
                      <Select
                          value={editedRoom.type}
                          onValueChange={(value: any) => setEditedRoom({...editedRoom, type: value})}
                      >
                        <SelectTrigger id="edit-room-type">
                          <SelectValue placeholder={t('rooms.placeholders.selectType')} />
                        </SelectTrigger>
                        <SelectContent>
                          {roomTypes.map((type, index) => (
                              <SelectItem key={index} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-room-description">{t('rooms.fields.description')}</Label>
                    <Textarea
                        id="edit-room-description"
                        placeholder={t('rooms.placeholders.description')}
                        value={editedRoom.description || ''}
                        onChange={(e) => setEditedRoom({...editedRoom, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-room-status">{t('rooms.fields.status')}</Label>
                    <Select
                        value={editedRoom.status}
                        onValueChange={(value: any) => setEditedRoom({...editedRoom, status: value})}
                    >
                      <SelectTrigger id="edit-room-status">
                        <SelectValue placeholder={t('rooms.placeholders.selectStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">{t('rooms.status.available')}</SelectItem>
                        <SelectItem value="unavailable">{t('rooms.status.unavailable')}</SelectItem>
                        <SelectItem value="maintenance">{t('rooms.status.maintenance')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveRoom(null)} disabled={updatingRoom}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSaveChanges} disabled={updatingRoom}>
                {updatingRoom ? t('rooms.actions.saving') : t('rooms.actions.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('rooms.dialogs.deleteRoom.title')}</DialogTitle>
              <DialogDescription>
                {t('rooms.dialogs.deleteRoom.description')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
                {t('common.cancel')}
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={isLoading}>
                {isLoading ? t('rooms.actions.deleting') : t('rooms.actions.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageLayout>
  );
};

export default RoomsPage;