import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { Bloc } from '../../../models/blocs.model';
import { BlocService } from '../../../services/blocs.service';
import { SalleService } from '../../../services/salle.service';
import { Salle } from '../../../models/salle.model';

@Component({
  selector: 'app-blocs',
  templateUrl: './blocs.component.html',
  styleUrls: ['./blocs.component.css']
})
export class BlocsComponent implements OnInit, AfterViewInit {
  blocs: Bloc[] = [];
  loading = false;
  error: string | null = null;
  
  // Main map
  map!: L.Map;
  markers: L.Marker[] = [];
  
  // Modal map properties
  modalMap?: L.Map;
  modalMarker?: L.Marker;
  
  // Modal properties
  showModal = false;
  modalTitle = '';
  currentBloc: Bloc = this.initializeBloc();
  isEditMode = false;

  // Delete modal
  showDeleteModal = false;
  blocToDelete: Bloc | null = null;

  // View location modal
  showLocationModal = false;
  locationViewBloc: Bloc | null = null;
  locationViewMap?: L.Map;

  constructor(private blocService: BlocService, private salleService: SalleService) { }

  ngOnInit(): void {
    this.loadBlocs();
  }

  ngAfterViewInit(): void {
    // Map will be initialized after data loads
  }

  private configureLeafletIcons() {
    const ICON_RETINA_URL = '/assets/marker-icon-2x.png';
    const ICON_URL = '/assets/marker-icon.png';
    const SHADOW_URL = '/assets/marker-shadow.png';
    
    // Only set if not already configured
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: ICON_RETINA_URL,
      iconUrl: ICON_URL,
      shadowUrl: SHADOW_URL
    });
  }

  initializeBloc(): Bloc {
    return {
      id: 0,
      nom: '',
      location: '',
      salles: []
    };
  }

  loadBlocs(): void {
    this.loading = true;
    this.blocService.getAll().subscribe({
      next: (data) => {
        this.blocs = data || [];
        this.error = null;
        this.loading = false;

        // Populate each bloc's salles then initialize map
        this.populateSalles();
      },
      error: (err) => {
        console.error('Error loading blocs:', err);
        if (err && err.status) {
          this.error = `Error ${err.status} ${err.statusText || ''} - ${err.message || 'Server error'}`;
        } else {
          this.error = err?.message || 'Failed to load blocs';
        }
        this.loading = false;
      }
    });
  }

  // Initialize main map after data loads
  private initMap(): void {
    this.configureLeafletIcons();

    // Destroy existing map if any
    if (this.map) {
      try { this.map.remove(); } catch(e) {}
    }

    const mapElement = document.getElementById('blocsMap');
    if (!mapElement) return;

    this.map = L.map('blocsMap').setView([36.8065, 10.1815], 8); // Center on Tunisia
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.addMarkers();
    
    // Ensure map layout is calculated after DOM updates
    setTimeout(() => {
      try { this.map.invalidateSize(); } catch(e) { /* ignore */ }
    }, 100);
  }

  // Initialize modal map for selecting bloc location
  private initModalMap(centerOnLocation: boolean = false): void {
    this.configureLeafletIcons();

    // Destroy existing modal map
    if (this.modalMap) {
      try { this.modalMap.remove(); } catch(e) {}
      this.modalMap = undefined;
    }

    // Check if modal map element exists
    const modalMapElement = document.getElementById('modalMap');
    if (!modalMapElement) return;

    // Default center (Tunis)
    let lat = 36.8065;
    let lng = 10.1815;
    let zoom = 13;

    // If editing and location contains coords or address, try to center
    if (centerOnLocation && this.currentBloc.location) {
      const coords = this.parseCoords(this.currentBloc.location);
      if (coords) {
        lat = coords[0];
        lng = coords[1];
        zoom = 15;
      } else {
        // Try forward geocode
        this.forwardGeocode(this.currentBloc.location).then(res => {
          if (res && this.modalMap) {
            this.placeModalMarker(res.lat, res.lon);
            this.modalMap.setView([res.lat, res.lon], 15);
          }
        }).catch(() => {});
      }
    }

    this.modalMap = L.map('modalMap').setView([lat, lng], zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.modalMap);

    // If coords were available, place marker
    if (centerOnLocation) {
      const coords = this.parseCoords(this.currentBloc.location);
      if (coords) {
        this.placeModalMarker(coords[0], coords[1]);
      }
    }

    // Click to set location
    this.modalMap.on('click', (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      this.placeModalMarker(lat, lng);
      
      // Reverse geocode
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.display_name) {
            this.currentBloc.location = data.display_name;
          } else {
            this.currentBloc.location = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          }
        })
        .catch(() => {
          this.currentBloc.location = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        });
    });

    // Ensure proper rendering
    setTimeout(() => { 
      try { this.modalMap?.invalidateSize(); } catch(e) {} 
    }, 150);
  }

  private placeModalMarker(lat: number, lng: number) {
    if (!this.modalMap) return;
    
    if (this.modalMarker) {
      try { this.modalMap.removeLayer(this.modalMarker); } catch(e) {}
    }
    
    // Use custom icon
    const icon = L.icon({
      iconUrl: '/assets/marker.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
    
    this.modalMarker = L.marker([lat, lng], { icon }).addTo(this.modalMap);
    this.modalMarker.bindPopup(`<b>Selected Location</b>`).openPopup();
  }

  // If location is "lat, lng" returns [lat, lng] else null
  private parseCoords(loc: string | undefined): [number, number] | null {
    if (!loc) return null;
    
    const parts = loc.split(',').map(s => s.trim());
    if (parts.length >= 2) {
      const a = parseFloat(parts[0]);
      const b = parseFloat(parts[1]);
      if (!isNaN(a) && !isNaN(b)) return [a, b];
    }
    return null;
  }

  // Forward geocode address -> {lat, lon} or null
  private async forwardGeocode(address: string): Promise<{lat: number, lon: number} | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return { 
          lat: parseFloat(data[0].lat), 
          lon: parseFloat(data[0].lon) 
        };
      }
    } catch (e) { 
      console.error('Geocoding error:', e);
    }
    return null;
  }

  private addMarkers(): void {
    // Clear existing markers
    this.markers.forEach(marker => {
      try { this.map.removeLayer(marker); } catch(e) {}
    });
    this.markers = [];

    if (!this.blocs || this.blocs.length === 0) return;

    this.blocs.forEach(bloc => {
      if (bloc.location) {
        const coords = this.parseCoords(bloc.location);
        
        if (coords) {
          const marker = L.marker([coords[0], coords[1]]).addTo(this.map);
          marker.bindPopup(`
            <strong>${bloc.nom}</strong><br/>
            ${bloc.location}<br/>
            <small>Salles: ${bloc.salles?.length || 0}</small>
          `);
          this.markers.push(marker);
        }
      }
    });

    // Fit bounds if there are markers
    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.2));
    }
  }

  // Open add modal
  openAddModal(): void {
    this.isEditMode = false;
    this.modalTitle = 'Add New Bloc';
    this.currentBloc = this.initializeBloc();
    this.showModal = true;
    
    // Initialize modal map after modal is shown
    setTimeout(() => this.initModalMap(false), 200);
  }

  // Open edit modal
  openEditModal(bloc: Bloc): void {
    this.isEditMode = true;
    this.modalTitle = 'Edit Bloc';
    this.currentBloc = { ...bloc };
    this.showModal = true;
    
    // Initialize modal map after modal is shown and center on existing location
    setTimeout(() => this.initModalMap(true), 200);
  }

  // Open delete confirmation modal
  openDeleteModal(bloc: Bloc): void {
    this.blocToDelete = bloc;
    this.showDeleteModal = true;
  }

  // Close modals
  closeModal(): void {
    this.showModal = false;
    this.currentBloc = this.initializeBloc();
    
    // Clean up modal map
    if (this.modalMap) {
      try { this.modalMap.remove(); } catch(e) {}
      this.modalMap = undefined;
      this.modalMarker = undefined;
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.blocToDelete = null;
  }

  // Open location view modal (read-only map)
  openLocationModal(bloc: Bloc): void {
    this.locationViewBloc = bloc;
    this.showLocationModal = true;
    // Initialize read-only map after modal is shown
    setTimeout(() => this.initLocationViewMap(), 200);
  }

  // Close location view modal
  closeLocationModal(): void {
    this.showLocationModal = false;
    this.locationViewBloc = null;
    // Clean up location view map
    if (this.locationViewMap) {
      try { this.locationViewMap.remove(); } catch(e) {}
      this.locationViewMap = undefined;
    }
  }

  // Initialize read-only map for viewing location
  // Initialize read-only map for viewing location
private initLocationViewMap(): void {
  if (!this.locationViewBloc) return;

  this.configureLeafletIcons();

  // Destroy existing location view map
  if (this.locationViewMap) {
    try { this.locationViewMap.remove(); } catch(e) {}
    this.locationViewMap = undefined;
  }

  const mapElement = document.getElementById('locationViewMap');
  if (!mapElement) {
    console.error('Location view map element not found');
    return;
  }

  // Show loading state
  mapElement.innerHTML = '<div class="map-loading">Loading map...</div>';

  // Default center (Tunis)
  let lat = 36.8065;
  let lng = 10.1815;
  let zoom = 13;

  // First try to parse coordinates directly
  if (this.locationViewBloc.location) {
    const coords = this.parseCoords(this.locationViewBloc.location);
    if (coords) {
      // Direct coordinates found
      this.initializeMapWithLocation(coords[0], coords[1], zoom, true);
    } else {
      // Try to geocode the address
      this.geocodeAddress(this.locationViewBloc.location).then(result => {
        if (result) {
          this.initializeMapWithLocation(result.lat, result.lon, 15, true);
        } else {
          // If geocoding fails, show default view with message
          this.initializeMapWithLocation(lat, lng, zoom, false);
        }
      }).catch(() => {
        this.initializeMapWithLocation(lat, lng, zoom, false);
      });
    }
  } else {
    // No location at all
    this.initializeMapWithLocation(lat, lng, zoom, false);
  }
}
private async geocodeAddress(address: string): Promise<{lat: number, lon: number} | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.length > 0) {
      return { 
        lat: parseFloat(data[0].lat), 
        lon: parseFloat(data[0].lon) 
      };
    }
  } catch (e) { 
    console.error('Geocoding error:', e);
  }
  return null;
}

// New method to initialize map with coordinates
private initializeMapWithLocation(lat: number, lng: number, zoom: number, hasValidLocation: boolean): void {
  // Clear the loading message
  const mapElement = document.getElementById('locationViewMap');
  if (mapElement) {
    mapElement.innerHTML = '';
  }

  // Create map
  this.locationViewMap = L.map('locationViewMap').setView([lat, lng], zoom);

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(this.locationViewMap);

  // Place marker if location is valid
  if (hasValidLocation && this.locationViewBloc) {
    // Create a custom red marker
    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = L.marker([lat, lng], { icon: redIcon }).addTo(this.locationViewMap);
    marker.bindPopup(`
      <b>${this.locationViewBloc.nom}</b><br/>
      ${this.locationViewBloc.location}
    `).openPopup();
  } else {
    // Show message that location couldn't be found
    const message = this.locationViewBloc?.location 
      ? `Could not find coordinates for: "${this.locationViewBloc.location}"`
      : 'No location set for this bloc';
    
    L.popup()
      .setLatLng([lat, lng])
      .setContent(`
        <b>${this.locationViewBloc?.nom || 'Bloc'}</b><br/>
        ${message}<br/>
        <small>Click on the map in edit mode to set a precise location</small>
      `)
      .openOn(this.locationViewMap);
  }

  // Ensure proper rendering
  setTimeout(() => {
    try { this.locationViewMap?.invalidateSize(); } catch(e) {}
  }, 150);
}

  // Save bloc (add or update)
  saveBloc(): void {
    if (this.isEditMode && this.currentBloc.id) {
      // Update
      this.blocService.update(this.currentBloc.id, this.currentBloc).subscribe({
        next: (updatedBloc) => {
          const index = this.blocs.findIndex(b => b.id === updatedBloc.id);
          if (index !== -1) {
            this.blocs[index] = updatedBloc;
          }
          this.closeModal();
          this.error = null;
          this.refreshMap();
        },
        error: (err) => {
          console.error('Error updating bloc:', err);
          this.error = err?.message || 'Failed to update bloc';
        }
      });
    } else {
      // Add
      this.blocService.add(this.currentBloc).subscribe({
        next: (newBloc) => {
          this.blocs.push(newBloc);
          this.closeModal();
          this.error = null;
          this.refreshMap();
        },
        error: (err) => {
          console.error('Error adding bloc:', err);
          this.error = err?.message || 'Failed to add bloc';
        }
      });
    }
  }

  // Delete bloc
  deleteBloc(): void {
    if (this.blocToDelete && this.blocToDelete.id) {
      this.blocService.delete(this.blocToDelete.id).subscribe({
        next: () => {
          this.blocs = this.blocs.filter(b => b.id !== this.blocToDelete?.id);
          this.closeDeleteModal();
          this.error = null;
          this.refreshMap();
        },
        error: (err) => {
          console.error('Error deleting bloc:', err);
          this.error = err?.message || 'Failed to delete bloc';
          this.closeDeleteModal();
        }
      });
    }
  }

  refreshMap(): void {
    if (this.map) {
      // Clear existing markers
      this.markers.forEach(marker => {
        try { this.map.removeLayer(marker); } catch(e) {}
      });
      this.markers = [];
      
      // Add new markers
      this.addMarkers();
    }
  }

  // Fetch all salles and attach to blocs by blocId
  private populateSalles(): void {
    this.salleService.getAll().subscribe({
      next: (salles: Salle[]) => {
        this.blocs = this.blocs.map(bloc => ({
          ...bloc,
          salles: salles.filter(salle => {
            const salleBlocId =
              (salle as any).bloc?.id ?? (salle as any).blocId;

            return String(salleBlocId) === String(bloc.id);
          })
        }));

        console.log('Salles attached to blocs:',
          this.blocs.map(b => ({
            blocId: b.id,
            sallesCount: b.salles?.length || 0
          }))
        );

        setTimeout(() => this.initMap(), 200);
      },

      error: (err) => {
        console.error('Error loading salles:', err);
        setTimeout(() => this.initMap(), 200);
      }
    });
  }

  retry(): void {
    this.error = null;
    this.loadBlocs();
  }

  // Helper method to get room count
  getSallesCount(bloc: Bloc): number {
    return bloc.salles?.length || 0;
  }

  // Helper method to check if bloc has salles
  hasSalles(bloc: Bloc): boolean {
    return !!(bloc.salles && bloc.salles.length > 0);
  }
}