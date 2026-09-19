import { HashRouter, Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/components/app-layout'
import { DeviceFormPage } from '@/pages/device-form'
import { DevicesListPage } from '@/pages/devices-list'
import { InterfaceFormPage } from '@/pages/interface-form'
import { InterfacesListPage } from '@/pages/interfaces-list'
import { LinkFormPage } from '@/pages/link-form'
import { LinksListPage } from '@/pages/links-list'
import { RackFormPage } from '@/pages/rack-form'
import { RacksListPage } from '@/pages/racks-list'
import { RoomFormPage } from '@/pages/room-form'
import { RoomsListPage } from '@/pages/rooms-list'

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/links" replace />} />
          <Route path="links" element={<LinksListPage />} />
          <Route path="links/new" element={<LinkFormPage />} />
          <Route path="links/:id/edit" element={<LinkFormPage />} />
          <Route path="rooms" element={<RoomsListPage />} />
          <Route path="rooms/new" element={<RoomFormPage />} />
          <Route path="rooms/:id/edit" element={<RoomFormPage />} />
          <Route path="racks" element={<RacksListPage />} />
          <Route path="racks/new" element={<RackFormPage />} />
          <Route path="racks/:id/edit" element={<RackFormPage />} />
          <Route path="devices" element={<DevicesListPage />} />
          <Route path="devices/new" element={<DeviceFormPage />} />
          <Route path="devices/:id/edit" element={<DeviceFormPage />} />
          <Route path="interfaces" element={<InterfacesListPage />} />
          <Route path="interfaces/new" element={<InterfaceFormPage />} />
          <Route path="interfaces/:id/edit" element={<InterfaceFormPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
