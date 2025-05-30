"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Droplets, Ruler, TrendingUp, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast, ToastContainer } from "react-toastify";

interface Medicion {
  fecha_medicion: string
  sensor_id: number
  sensor_nombre: string
  muestras: number[]
  altura_agua: number
  distancia_media: number
  velocidad_subida: number
  estado: "normal" | "alto" | "critico"
}

interface Sensor {
  id: number
  nombre: string
  altura: number
  altura_alta: number
  altura_critica: number
  correo_aviso: string
  ubicacion?: string
  estado?: string
}

export default function SensorDashboard() {
  const [mediciones, setMediciones] = useState<Medicion[]>([])
  const [sensores, setSensores] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)
  const [nuevaAltura, setNuevaAltura] = useState("")
  const [nuevaAlturaAlta, setNuevaAlturaAlta] = useState("")
  const [nuevaAlturaCritica, setNuevaAlturaCritica] = useState("")
  const [nuevoCorreoAviso, setNuevoCorreoAviso] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [umbralDialogOpen, setUmbralDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  // URL base del endpoint - ajusta según tu configuración
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

  const obtenerMediciones = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/mediciones`)
      if (!response.ok) throw new Error("Error al obtener mediciones")
      const data = await response.json()
      setMediciones(data)
      toast.success("Mediciones actualizadas correctamente", {
        position: "top-left",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        });
    } catch (error) {
      toast.error("No se pudieron obtener las mediciones", {
        position: "top-left",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const obtenerSensores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sensores`)
      if (!response.ok) throw new Error("Error al obtener sensores")
      const data = await response.json()
      setSensores(data)
    } catch (error) {
      toast.error("No se pudieron obtener los sensores", {
        position: "top-left",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true, 
        });
      console.error("Error:", error)
    }
  }

  const modificarAlturaSensor = async (sensorId: number, nuevaAltura: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sensores/${sensorId}/altura`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nueva_altura: nuevaAltura }),
      })

      if (!response.ok) throw new Error("Error al modificar sensor")

      await obtenerSensores()
      setDialogOpen(false)
      setNuevaAltura("")
      toast.success(`La altura del sensor se actualizó a ${nuevaAltura} cm`, {
        position: "top-left",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true, 
        });
    } catch (error) {
      toast.error("No se pudo modificar la altura del sensor", {
        position: "top-left",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true, 
        });
      console.error("Error:", error)
    }
  }

  const modificarUmbralesSensor = async (
    sensorId: number,
    alturaAlta: number,
    alturaCritica: number,
    correoAviso: string,
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sensores/${sensorId}/umbral`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          altura_alta: alturaAlta,
          altura_critica: alturaCritica,
          correo_aviso: correoAviso,
        }),
      })

      if (!response.ok) throw new Error("Error al modificar umbrales del sensor")

      await obtenerSensores()
      setDialogOpen(false)
      toast.success(
        `Umbrales del sensor actualizados: Alto ${alturaAlta} cm, Crítico ${alturaCritica} cm, Correo: ${correoAviso}`,
        {
          position: "top-left",
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true, 
        }
      )
      setUmbralDialogOpen(false)
    } catch (error) {
      toast.error("No se pudieron modificar los umbrales del sensor", {
        position: "top-left",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      console.error("Error:", error)
    }
  }

  const limpiarMedicionesSensor = async (sensorId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sensores/${sensorId}/limpiar_mediciones`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al limpiar mediciones")

      await obtenerMediciones()
      toast.success(
        `Se han limpiado las mediciones del sensor correctamente`,
        {
          position: "top-left",
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true, 
        }
      )
    } catch (error) {
      toast.error("No se pudieron limpiar las medicione", {
        position: "top-left",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      console.error("Error:", error)
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calcularPromedio = (muestras: number[]) => {
    return (muestras.reduce((a, b) => a + b, 0) / muestras.length).toFixed(2)
  }

  useEffect(() => {
    obtenerMediciones()
    obtenerSensores()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Sensores de Agua 💦</h1>
          <p className="text-muted-foreground">Monitoreo en tiempo real de niveles de agua</p>
        </div>
        <Button onClick={obtenerMediciones} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      <Tabs defaultValue="mediciones" className="space-y-4 ">
        <TabsList>
          <TabsTrigger value="mediciones">Mediciones</TabsTrigger>
          <TabsTrigger value="sensores">Gestión de Sensores</TabsTrigger>
        </TabsList>

        <TabsContent value="mediciones" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sensores</CardTitle>
                <Droplets className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sensores.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mediciones Hoy</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mediciones.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Altura Promedio</CardTitle>
                <Ruler className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mediciones.length > 0
                    ? (mediciones.reduce((acc, m) => acc + m.altura_agua, 0) / mediciones.length).toFixed(1)
                    : "0"}{" "}
                  cm
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Velocidad Promedio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mediciones.length > 0
                    ? (mediciones.reduce((acc, m) => acc + m.velocidad_subida, 0) / mediciones.length).toFixed(2)
                    : "0"}{" "}
                  cm
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mediciones Recientes</CardTitle>
              <CardDescription>Últimas mediciones de todos los sensores</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Sensor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Altura Agua</TableHead>
                    <TableHead>Velocidad Subida del Agua</TableHead>
                    <TableHead>Muestras</TableHead>
                    <TableHead>Distancia promedio con respecto al sensor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mediciones.map((medicion, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{formatearFecha(medicion.fecha_medicion)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{medicion.sensor_nombre}</div>
                          <div className="text-sm text-muted-foreground">ID: {medicion.sensor_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            medicion.estado === "critico"
                              ? "destructive"
                              : medicion.estado === "alto"
                                ? "warning"
                                : "success"
                          }
                        >
                          {medicion.estado.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{medicion.altura_agua} cm</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={medicion.velocidad_subida > 0 ? "destructive" : medicion.velocidad_subida < 0 ? "success" : "secondary"}>
                          {medicion.velocidad_subida>0?"↑ "+medicion.velocidad_subida.toFixed(4) :medicion.velocidad_subida < 0 ? "↓ "+(-medicion.velocidad_subida).toFixed(4):"0"} cm/s
                        </Badge>
                      </TableCell>
                      <TableCell>{medicion.muestras.length} muestras</TableCell>
                      <TableCell>{medicion.distancia_media} cm</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {mediciones.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No hay mediciones disponibles</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Sensores</CardTitle>
              <CardDescription>Administra la configuración de tus sensores</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Altura Actual</TableHead>
                    <TableHead>Umbral Alto</TableHead>
                    <TableHead>Umbral Crítico</TableHead>
                    <TableHead>Correo Aviso</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sensores.map((sensor) => (
                    <TableRow key={sensor.id}>
                      <TableCell className="font-medium">{sensor.id}</TableCell>
                      <TableCell>{sensor.nombre}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sensor.altura} cm</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="warning">{sensor.altura_alta} cm</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{sensor.altura_critica} cm</Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">{sensor.correo_aviso}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog open={dialogOpen && selectedSensor?.id === sensor.id} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSensor(sensor)
                                  setNuevaAltura(sensor.altura.toString())
                                  setDialogOpen(true)
                                }}
                              >
                                Modificar Altura
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Modificar Altura del Sensor</DialogTitle>
                                <DialogDescription>Cambia la altura del sensor {sensor.nombre}</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="altura" className="text-right">
                                    Altura (cm)
                                  </Label>
                                  <Input
                                    id="altura"
                                    type="number"
                                    value={nuevaAltura}
                                    onChange={(e) => setNuevaAltura(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Ingresa la nueva altura"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={() => {
                                    if (selectedSensor && nuevaAltura) {
                                      modificarAlturaSensor(selectedSensor.id, Number.parseFloat(nuevaAltura))
                                    }
                                  }}
                                  disabled={!nuevaAltura || isNaN(Number.parseFloat(nuevaAltura))}
                                >
                                  Guardar Cambios
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={umbralDialogOpen && selectedSensor?.id === sensor.id}
                            onOpenChange={setUmbralDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSensor(sensor)
                                  setNuevaAlturaAlta(sensor.altura_alta.toString())
                                  setNuevaAlturaCritica(sensor.altura_critica.toString())
                                  setNuevoCorreoAviso(sensor.correo_aviso)
                                  setUmbralDialogOpen(true)
                                }}
                              >
                                Umbrales
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Configurar Umbrales</DialogTitle>
                                <DialogDescription>
                                  Configura los umbrales de alerta para el sensor {sensor.nombre}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="alturaAlta" className="text-right">
                                    Altura Alta (cm)
                                  </Label>
                                  <Input
                                    id="alturaAlta"
                                    type="number"
                                    value={nuevaAlturaAlta}
                                    onChange={(e) => setNuevaAlturaAlta(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Umbral para nivel alto"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="alturaCritica" className="text-right">
                                    Altura Crítica (cm)
                                  </Label>
                                  <Input
                                    id="alturaCritica"
                                    type="number"
                                    value={nuevaAlturaCritica}
                                    onChange={(e) => setNuevaAlturaCritica(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Umbral para nivel crítico"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="correoAviso" className="text-right">
                                    Correo de Aviso
                                  </Label>
                                  <Input
                                    id="correoAviso"
                                    type="email"
                                    value={nuevoCorreoAviso}
                                    onChange={(e) => setNuevoCorreoAviso(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Email para notificaciones"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={() => {
                                    if (selectedSensor && nuevaAlturaAlta && nuevaAlturaCritica) {
                                      modificarUmbralesSensor(
                                        selectedSensor.id,
                                        Number.parseFloat(nuevaAlturaAlta),
                                        Number.parseFloat(nuevaAlturaCritica),
                                        nuevoCorreoAviso,
                                      )
                                    }
                                  }}
                                  disabled={
                                    !nuevaAlturaAlta ||
                                    !nuevaAlturaCritica ||
                                    isNaN(Number.parseFloat(nuevaAlturaAlta)) ||
                                    isNaN(Number.parseFloat(nuevaAlturaCritica)) ||
                                    !nuevoCorreoAviso
                                  }
                                >
                                  Guardar Umbrales
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={confirmDialogOpen && selectedSensor?.id === sensor.id}
                            onOpenChange={setConfirmDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedSensor(sensor)
                                  setConfirmDialogOpen(true)
                                }}
                              >
                                Limpiar mediciones
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirmar Limpieza</DialogTitle>
                                <DialogDescription>
                                  ¿Estás seguro de que deseas limpiar todas las mediciones del sensor {sensor.nombre}?
                                  Esta acción no se puede deshacer.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                                  Cancelar
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    if (selectedSensor) {
                                      limpiarMedicionesSensor(selectedSensor.id)
                                      setConfirmDialogOpen(false)
                                    }
                                  }}
                                >
                                  Confirmar Limpieza
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {sensores.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No hay sensores configurados</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
