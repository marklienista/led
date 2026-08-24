using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text.Json;

namespace SomDaTurma.WindowsAgent;

internal enum LedState { Off, Listen, Block }
internal sealed record LedCommand(LedState State, string Room, long TimestampMs);

internal static class Program
{
    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new AgentContext());
    }
}

internal sealed class AgentContext : ApplicationContext
{
    private const string SupabaseUrl = "https://eyfmhnlzduoobdmwexmc.supabase.co";
    private const string SupabaseKey = "sb_publishable_as-eMTlem4cWd29PVNFAhg_uVLIqZKu";
    private const string Table = "invencoes_ranking";
    private static readonly TimeSpan CommandMaxAge = TimeSpan.FromHours(2);
    private static readonly TimeSpan FailOpenAfter = TimeSpan.FromSeconds(8);

    private readonly HttpClient http = new();
    private readonly System.Windows.Forms.Timer timer = new() { Interval = 800 };
    private readonly List<OverlayForm> overlays = [];
    private readonly NotifyIcon tray;
    private KeyboardBlocker? blocker;
    private LedState shownState = LedState.Off;
    private string shownRoom = "";
    private DateTime lastSuccess = DateTime.MinValue;
    private DateTime bypassUntil = DateTime.MinValue;
    private bool polling;

    public AgentContext()
    {
        http.DefaultRequestHeaders.TryAddWithoutValidation("apikey", SupabaseKey);

        var menu = new ContextMenuStrip();
        menu.Items.Add("Liberar este computador por 5 min", null, (_, _) => EmergencyBypass());
        menu.Items.Add("Sair", null, (_, _) => ExitAgent());
        tray = new NotifyIcon
        {
            Icon = SystemIcons.Information,
            Text = "Som da Turma • LED",
            Visible = true,
            ContextMenuStrip = menu
        };

        timer.Tick += async (_, _) => await PollAsync();
        timer.Start();
        _ = PollAsync();
    }

    private async Task PollAsync()
    {
        if (polling) return;
        polling = true;
        try
        {
            var q = "?select=nome,criado_em&nome=like.CTRL%7C*&order=criado_em.desc&limit=1";
            using var response = await http.GetAsync($"{SupabaseUrl}/rest/v1/{Table}{q}");
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var command = Parse(json);
            lastSuccess = DateTime.UtcNow;
            Apply(command);
        }
        catch
        {
            // Segurança: se a rede cair, o computador não pode ficar preso indefinidamente.
            if (lastSuccess == DateTime.MinValue || DateTime.UtcNow - lastSuccess > FailOpenAfter)
                Apply(new LedCommand(LedState.Off, "", 0));
        }
        finally { polling = false; }
    }

    private static LedCommand Parse(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind != JsonValueKind.Array || doc.RootElement.GetArrayLength() == 0)
                return new(LedState.Off, "", 0);

            var row = doc.RootElement[0];
            var name = row.TryGetProperty("nome", out var n) ? n.GetString() ?? "" : "";
            var parts = name.Split('|');
            if (parts.Length < 4 || parts[0] != "CTRL") return new(LedState.Off, "", 0);
            if (!long.TryParse(parts[1], out var ts)) return new(LedState.Off, "", 0);

            var age = DateTimeOffset.UtcNow - DateTimeOffset.FromUnixTimeMilliseconds(ts);
            if (age > CommandMaxAge || age < TimeSpan.FromMinutes(-2)) return new(LedState.Off, "", ts);

            var state = parts[2] switch
            {
                "LISTEN" => LedState.Listen,
                "BLOCK" => LedState.Block,
                _ => LedState.Off
            };
            return new(state, parts[3].Trim(), ts);
        }
        catch { return new(LedState.Off, "", 0); }
    }

    private void Apply(LedCommand command)
    {
        if (DateTime.UtcNow < bypassUntil)
        {
            HideOverlays();
            return;
        }

        if (command.State == LedState.Off)
        {
            HideOverlays();
            return;
        }

        if (shownState == command.State && shownRoom == command.Room && overlays.Count > 0)
        {
            foreach (var form in overlays) form.ReassertTopMost();
            return;
        }

        HideOverlays();
        shownState = command.State;
        shownRoom = command.Room;

        foreach (var screen in Screen.AllScreens)
        {
            var form = new OverlayForm(screen, command.State, command.Room);
            overlays.Add(form);
            form.Show();
            form.ReassertTopMost();
        }

        blocker = new KeyboardBlocker(EmergencyBypass);
        blocker.Start();
    }

    private void HideOverlays()
    {
        blocker?.Dispose();
        blocker = null;
        foreach (var form in overlays)
        {
            form.AllowClose = true;
            form.Close();
            form.Dispose();
        }
        overlays.Clear();
        shownState = LedState.Off;
        shownRoom = "";
    }

    private void EmergencyBypass()
    {
        bypassUntil = DateTime.UtcNow.AddMinutes(5);
        HideOverlays();
        tray.ShowBalloonTip(2500, "Som da Turma", "Este computador foi liberado por 5 minutos.", ToolTipIcon.Info);
    }

    private void ExitAgent()
    {
        timer.Stop();
        HideOverlays();
        tray.Visible = false;
        tray.Dispose();
        http.Dispose();
        ExitThread();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            timer.Dispose();
            blocker?.Dispose();
            tray.Dispose();
            http.Dispose();
        }
        base.Dispose(disposing);
    }
}

internal sealed class OverlayForm : Form
{
    public bool AllowClose { get; set; }

    public OverlayForm(Screen screen, LedState state, string room)
    {
        FormBorderStyle = FormBorderStyle.None;
        StartPosition = FormStartPosition.Manual;
        Bounds = screen.Bounds;
        TopMost = true;
        ShowInTaskbar = false;
        ControlBox = false;
        BackColor = state == LedState.Block ? Color.FromArgb(153, 27, 27) : Color.FromArgb(37, 99, 235);
        KeyPreview = true;

        var icon = new Label
        {
            Text = state == LedState.Block ? "⛔" : "👂",
            Dock = DockStyle.Top,
            Height = 150,
            TextAlign = ContentAlignment.BottomCenter,
            Font = new Font("Segoe UI Emoji", 72, FontStyle.Regular)
        };
        var title = new Label
        {
            Text = state == LedState.Block ? "AULA PARADA" : "OUVIR",
            Dock = DockStyle.Fill,
            TextAlign = ContentAlignment.MiddleCenter,
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 72, FontStyle.Bold)
        };
        var subtitle = new Label
        {
            Text = state == LedState.Block ? "OLHE PARA O PROFESSOR" : "FIQUE ATENTO",
            Dock = DockStyle.Bottom,
            Height = 125,
            TextAlign = ContentAlignment.TopCenter,
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 30, FontStyle.Bold)
        };
        var roomLabel = new Label
        {
            Text = string.IsNullOrWhiteSpace(room) ? "" : $"🏫 {room}",
            AutoSize = true,
            Left = 24,
            Top = 20,
            ForeColor = Color.White,
            BackColor = Color.Transparent,
            Font = new Font("Segoe UI", 20, FontStyle.Bold)
        };

        Controls.Add(title);
        Controls.Add(icon);
        Controls.Add(subtitle);
        Controls.Add(roomLabel);

        Deactivate += (_, _) => BeginInvoke(ReassertTopMost);
        FormClosing += (_, e) => { if (!AllowClose) e.Cancel = true; };
    }

    public void ReassertTopMost()
    {
        if (IsDisposed) return;
        TopMost = true;
        BringToFront();
        Activate();
    }
}

internal sealed class KeyboardBlocker : IDisposable
{
    private const int WhKeyboardLl = 13;
    private const int WmKeyDown = 0x0100;
    private const int WmSysKeyDown = 0x0104;
    private const int VkLwin = 0x5B, VkRwin = 0x5C, VkTab = 0x09, VkEscape = 0x1B, VkF4 = 0x73, VkF12 = 0x7B;
    private const int VkControl = 0x11, VkMenu = 0x12, VkShift = 0x10;

    private readonly Action emergency;
    private readonly LowLevelKeyboardProc proc;
    private IntPtr hook = IntPtr.Zero;

    public KeyboardBlocker(Action emergency)
    {
        this.emergency = emergency;
        proc = HookCallback;
    }

    public void Start()
    {
        if (hook != IntPtr.Zero) return;
        using var process = Process.GetCurrentProcess();
        using var module = process.MainModule;
        hook = SetWindowsHookEx(WhKeyboardLl, proc, GetModuleHandle(module?.ModuleName), 0);
    }

    private IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
    {
        if (nCode >= 0 && (wParam == (IntPtr)WmKeyDown || wParam == (IntPtr)WmSysKeyDown))
        {
            var key = Marshal.ReadInt32(lParam);
            bool ctrl = Down(VkControl), alt = Down(VkMenu), shift = Down(VkShift);

            // Saída local de segurança: Ctrl+Alt+Shift+F12 libera por 5 minutos.
            if (key == VkF12 && ctrl && alt && shift)
            {
                emergency();
                return (IntPtr)1;
            }

            bool blocked = key == VkLwin || key == VkRwin ||
                           (key == VkTab && alt) ||
                           (key == VkEscape && ctrl) ||
                           (key == VkEscape && alt) ||
                           (key == VkF4 && alt) ||
                           (key == VkEscape && ctrl && shift);
            if (blocked) return (IntPtr)1;
        }
        return CallNextHookEx(hook, nCode, wParam, lParam);
    }

    private static bool Down(int key) => (GetAsyncKeyState(key) & 0x8000) != 0;

    public void Dispose()
    {
        if (hook != IntPtr.Zero)
        {
            UnhookWindowsHookEx(hook);
            hook = IntPtr.Zero;
        }
        GC.SuppressFinalize(this);
    }

    private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);
    [DllImport("user32.dll", SetLastError = true)] private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);
    [DllImport("user32.dll", SetLastError = true)] private static extern bool UnhookWindowsHookEx(IntPtr hhk);
    [DllImport("user32.dll")] private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);
    [DllImport("user32.dll")] private static extern short GetAsyncKeyState(int vKey);
    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)] private static extern IntPtr GetModuleHandle(string? lpModuleName);
}
