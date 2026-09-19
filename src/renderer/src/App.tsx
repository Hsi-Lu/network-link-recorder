import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router'
import type { ComponentType } from 'react'
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

function keyed(Page: ComponentType) {
  return function KeyedFormPage() {
    const { id } = useParams()
    return <Page key={id ?? 'new'} />
  }
}

const KeyedLinkFormPage = keyed(LinkFormPage)
const KeyedRoomFormPage = keyed(RoomFormPage)
const KeyedRackFormPage = keyed(RackFormPage)
const KeyedDeviceFormPage = keyed(DeviceFormPage)
const KeyedInterfaceFormPage = keyed(InterfaceFormPage)

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/links" replace />} />
          <Route path="links" element={<LinksListPage />} />
          <Route path="links/new" element={<KeyedLinkFormPage />} />
          <Route path="links/:id/edit" element={<KeyedLinkFormPage />} />
          <Route path="rooms" element={<RoomsListPage />} />
          <Route path="rooms/new" element={<KeyedRoomFormPage />} />
          <Route path="rooms/:id/edit" element={<KeyedRoomFormPage />} />
          <Route path="racks" element={<RacksListPage />} />
          <Route path="racks/new" element={<KeyedRackFormPage />} />
          <Route path="racks/:id/edit" element={<KeyedRackFormPage />} />
          <Route path="devices" element={<DevicesListPage />} />
          <Route path="devices/new" element={<KeyedDeviceFormPage />} />
          <Route path="devices/:id/edit" element={<KeyedDeviceFormPage />} />
          <Route path="interfaces" element={<InterfacesListPage />} />
          <Route path="interfaces/new" element={<KeyedInterfaceFormPage />} />
          <Route path="interfaces/:id/edit" element={<KeyedInterfaceFormPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
