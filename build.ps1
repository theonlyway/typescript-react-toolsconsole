$requirements = Get-ChildItem -Include "requirements.txt" -Recurse
$archiveFolder = Get-Item -Path .\modules\backend\archives
$zips = Get-ChildItem -Path $archiveFolder.FullName | Remove-Item -Confirm:$false
#$zips = Get-ChildItem -Path $archiveFolder.FullName | Where-Object { $_.Name -ne "tools-console.zip" } | Remove-Item -Confirm:$false
foreach ($requirement in $requirements)
{
    if ($requirement.directory.name -eq "common")
    {
        Write-Output "Processing: $($requirement.DirectoryName)"
        Remove-Item -Path "$env:TEMP\$($requirement.directory.name)" -ErrorAction SilentlyContinue -Recurse -Confirm:$false -Force
        Copy-Item -Path $requirement.DirectoryName -Destination "$env:TEMP\$($requirement.directory.name)" -Recurse
        pip install -r $requirement.FullName --target "$env:TEMP\$($requirement.directory.name)\python"
        Remove-Item -Path ($archiveFolder.FullName + "\" + $requirement.directory.name + ".zip") -Confirm:$false -ErrorAction SilentlyContinue
        Compress-Archive -Path "$env:TEMP\$($requirement.directory.name)\*" -DestinationPath ($archiveFolder.FullName + "\" + $requirement.directory.name + ".zip")
    }
    else
    {
        Write-Output "Processing: $($requirement.DirectoryName)"
        Remove-Item -Path "$env:TEMP\$($requirement.directory.name)" -ErrorAction SilentlyContinue -Recurse -Confirm:$false -Force
        Copy-Item -Path $requirement.DirectoryName -Destination "$env:TEMP\$($requirement.directory.name)" -Recurse
        pip install -r $requirement.FullName --target "$env:TEMP\$($requirement.directory.name)"
        Remove-Item -Path ($archiveFolder.FullName + "\" + $requirement.directory.name + ".zip") -Confirm:$false -ErrorAction SilentlyContinue
        Compress-Archive -Path "$env:TEMP\$($requirement.directory.name)\*" -DestinationPath ($archiveFolder.FullName + "\" + $requirement.directory.name + ".zip")
    }
}


Remove-Item ($archiveFolder.FullName + "\tools-console.zip") -Force
& 'C:\Program Files\7-Zip\7z.exe' a ($archiveFolder.FullName + "\tools-console.zip") .\tools-console -xr!node_modules -xr!amplify -xr!build -xr!'.vscode' -xr!'aws_config.tsx' -xr!'aws-exports.js'
